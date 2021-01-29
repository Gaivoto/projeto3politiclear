<template>
    <div class="viewWrapper">
        <svg id="grafo">
        
        </svg>
        <div class="divBottom">
            <label style="float: left">Legenda de ligações:</label>
            <div class="legendaColor" style="background-color: #CC0000;"></div>
            <label class="legendaText" style="color: #CC0000;">Acerca de</label>
            <div class="legendaColor" style="background-color: #999999;"></div>
            <label class="legendaText" style="color: #999999;">Gera</label>
            <div class="legendaColor" style="background-color: #994C00;"></div>
            <label class="legendaText" style="color: #994C00;">Propõe</label>
            <div class="legendaColor" style="background-color: #000000;"></div>
            <label class="legendaText" style="color: #000000;">Assina</label>
            <div class="legendaColor" style="background-color: #FF66FF;"></div>
            <label class="legendaText" style="color: #FF66FF;">Pertence a</label>
            <div class="legendaColor" style="background-color: #CCCC00;"></div>
            <label class="legendaText" style="color: #CCCC00;">Participa em</label>
            <div class="legendaColor" style="background-color: #3399FF;"></div>
            <label class="legendaText" style="color: #3399FF;">Organiza</label>
            <div class="legendaColor" style="background-color: #CC00CC;"></div>
            <label class="legendaText" style="color: #CC00CC;">Vence</label>
            <div class="legendaColor" style="background-color: #00CC00;"></div>
            <label class="legendaText" style="color: #00CC00;">Cria</label>
        </div>
        <div class="divBottom">
            <label style="float: left">Controlos: Botão esquerdo do rato - arrastar nodos. Click botão direito do rato num nodo - ir para a página do mesmo. Roda do rato - zoom.</label>
        </div>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import ErrorModal from '@/components/modals/ErrorModal.vue'
import * as d3 from 'd3'

export default {
    name: "Grafo",
    components: {
        ErrorModal
    },
    data(){
        return {
            msg: "",
            isErrorVisible: false,
            nodes: [],
            links: [],
            dim: 500,
            types: ["ACERCA_DE", "GERA", "PROPOE", "ASSINA", "PERTENCE_A", "PARTICIPA_EM", "ORGANIZA", "VENCE", "CRIA"],
            width: 1000,
            height: 1000,
            node: null
        }
    },
    mounted(){
        this.getData().then(() => {
            this.loadData();
        });
    },
    methods: {
        async getData(){
            await axios({
                method: 'get',
                url: "http://localhost:3000/api/grafo"
            })
            .then(response => {
                this.nodes = response.data.nodes;
                this.links = response.data.links;
            })
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
            });
        },
        loadData(){
            const links = this.links.map(d => Object.create(d));
            const nodes = this.nodes.map(d => Object.create(d));

            let vue = this;

            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).distance(350).id(d => d.id))
                .force("charge", d3.forceManyBody().strength(-2000).distanceMin(0).distanceMax(2000))
                .force("collide", d3.forceCollide().strength(1).radius(10).iterations(10));

            const svg = d3.select("#grafo")
                .attr("viewBox", "-250 -250 500 500")
                .on("wheel", e => this.changeDim(e.deltaY, svg));

            svg.append("defs").selectAll("marker")
                .data(this.types)
                .join("marker")
                .attr("id", d => `arrow-${d}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", 0)
                .attr("markerWidth", 10)
                .attr("markerHeight", 10)
                .attr("orient", "auto")
                .append("path")
                .attr("fill", d => vue.getArrowColor(d))
                .attr("d", "M0,-5L10,0L0,5");

            const link = svg.append("g")
                .attr("fill", "none")
                .attr("stroke-width", 2)
                .selectAll("path")
                .data(links)
                .join("path")
                .attr("stroke", d => vue.getArrowColor(d.type))
                .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

            this.node = svg.append("g")
                .attr("fill", "#666666")
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .attr("class", "node")
                .on("contextmenu", (e) => {
                    e.preventDefault();
                    var url = "/";

                    if(e.path[1].__data__.tipo == "CidadaoCreditado"){
                        url += "CidadaosCreditados";
                    } else if(e.path[1].__data__.tipo == "CidadaoRegistado"){
                        url += "CidadaosRegistados";
                    } else if(e.path[1].__data__.tipo == "Organizacao"){
                        url += "Organizacoes";
                    } else {
                        url += (e.path[1].__data__.tipo + "s");
                    }

                    url += ("/" +  e.path[1].__data__.propriedades.id);

                    this.$router.push(url);
                })
                .selectAll("g")
                .data(nodes)
                .join("g")
                .call(this.drag(simulation, vue));

            this.node.append("circle")
                .attr("x", 100)
                .attr("stroke", d => {
                    if(d.tipo == vue.$store.getters.getNode.tipo && d.propriedades.id == vue.$store.getters.getNode.id){
                        return "red";
                    } else {
                        return "black";
                    }
                })
                .attr("stroke-width", d => {
                    if(d.tipo == vue.$store.getters.getNode.tipo && d.propriedades.id == vue.$store.getters.getNode.id){
                        return 5;
                    } else {
                        return 2.5;
                    }
                })
                .attr("r", d => {
                    if(d.tipo == vue.$store.getters.getNode.tipo && d.propriedades.id == vue.$store.getters.getNode.id){
                        return 22;
                    } else {
                        return 15;
                    }
                });

            this.node.append("text")
                .attr("x", d => {
                    if(d.tipo == vue.$store.getters.getNode.tipo && d.propriedades.id == vue.$store.getters.getNode.id){
                        return 30;
                    } else {
                        return 18;
                    }
                })
                .attr("y", 0)
                .style("font-size", "16px")
                .text(d => {
                    if(d.tipo == "CidadaoRegistado"){
                        return "Cidadão Registado";
                    } else if(d.tipo == "CidadaoCreditado"){
                        return "Cidadão Creditado";
                    } else if(d.tipo == "Organizacao"){
                        return "Organização";
                    } else if(d.tipo == "Politico"){
                        return "Político";
                    } else {
                        return d.tipo;
                    }
                })
                .clone(true).lower()
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-width", 3);

            this.node.append("text")
                .attr("x", d => {
                    if(d.tipo == vue.$store.getters.getNode.tipo && d.propriedades.id == vue.$store.getters.getNode.id){
                        return 30;
                    } else {
                        return 18;
                    }
                })
                .attr("y", 20)
                .style("font-size", "20px")
                .text(d => {
                    if(d.propriedades.nome){
                        return d.propriedades.nome;
                    } else if(d.propriedades.titulo){
                        return d.propriedades.titulo;
                    } else {
                        return d.propriedades.descricao;
                    }
                })
                .clone(true).lower()
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-width", 3);

            simulation.on("tick", () => {
                link.attr("d", this.linkArc);
                this.node.attr("transform", d => `translate(${d.x},${d.y})`);

                if(this.$store.getters.getNode.tipo != ""){
                    var n = d3.selectAll(".node");
                    if(n._groups && n._groups[0] && n._groups[0][0] && n._groups[0][0].childNodes){
                        n._groups[0][0].childNodes.forEach(node => {
                            if(node.__data__.propriedades.id == this.$store.getters.getNode.id && node.__data__.tipo == this.$store.getters.getNode.tipo){
                                var x = node.__data__.x - (vue.dim / 2) , y = node.__data__.y - (vue.dim / 2);
                                svg.attr("viewBox", `${x} ${y} ${vue.dim} ${vue.dim}`);
                            }
                        });
                    }
                }
            });
        },
        getArrowColor(d){
            switch(d){
                case "ACERCA_DE":
                    return "#CC0000";
                    break;
                case "GERA":
                    return "#999999";
                    break;
                case "PROPOE":
                    return "#994C00";
                    break;
                case "ASSINA":
                    return "#000000";
                    break;
                case "PERTENCE_A":
                    return "#FF66FF";
                    break;
                case "PARTICIPA_EM":
                    return "#CCCC00";
                    break;
                case "ORGANIZA":
                    return "#3399FF";
                    break;
                case "VENCE":
                    return "#CC00CC";
                    break;
                case "CRIA":
                    return "#00CC00";
                    break;
            }
        },
        showError(msg){
            this.isErrorVisible = true;
            this.msg = msg;
        },
        hideError(){
            this.isErrorVisible = false;
            this.msg = "";
        },
        changeDim(direction, svg){
            this.dim = (direction < 0) ? this.dim - 100 : this.dim + 100;

            if(this.dim <= 0){
                this.dim = 100;
            }

            if(this.$store.getters.getNode.tipo != ""){
                var n = d3.selectAll(".node");
                if(n._groups && n._groups[0] && n._groups[0][0] && n._groups[0][0].childNodes){
                    n._groups[0][0].childNodes.forEach(node => {
                        if(node.__data__.propriedades.id == this.$store.getters.getNode.id && node.__data__.tipo == this.$store.getters.getNode.tipo){
                            var x = node.__data__.x - (this.dim / 2) , y = node.__data__.y - (this.dim / 2);
                            svg.attr("viewBox", `${x} ${y} ${this.dim} ${this.dim}`);
                        }
                    });    
                }
            }
        },
        drag(simulation, vue){
            function dragstarted(event, d) {
                if(d.tipo != vue.$store.getters.getNode.tipo || d.propriedades.id != vue.$store.getters.getNode.id){
                    if (!event.active) simulation.alphaTarget(0.5).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
            }
            
            function dragged(event, d) {
                if(d.tipo != vue.$store.getters.getNode.tipo || d.propriedades.id != vue.$store.getters.getNode.id){
                    d.fx = event.x;
                    d.fy = event.y;
                }
            }
            
            function dragended(event, d) {
                if(d.tipo != vue.$store.getters.getNode.tipo || d.propriedades.id != vue.$store.getters.getNode.id){
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }
            }
            
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        },
        linkArc(d) {
            const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
            return `
                M${d.source.x},${d.source.y}
                A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
            `;
        }
    }
}
</script>

<style scoped>
    svg {
        border: solid black 1px;
        height: 590px;
        width: 95%;
        background-color: white;
        margin-top: 10px;
    }

    #grafo {
        transform-origin: 50% 50%;
    }

    .divBottom {
        height: 18px; 
        width: 94.4%; 
        border: solid black 1px; 
        margin-left: 2.4%; 
        padding: 5px;
        background-color: white;
        border-radius: 5px;
        overflow: auto;
        text-align: left;
    }

    .legendaColor {
        height: 15px; 
        width: 15px; 
        float: left; 
        margin-left: 15px;
    }

    .legendaText {
        float: left; 
        margin-left: 5px
    }
</style>