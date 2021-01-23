<template>
  <div>
    <div id="divImg">
      <img src="../assets/logo_background.jpg" id="logoBackground"/>
      <img src="../assets/logo_homepage.png" id="logo"/>
    </div>
    <div id="smallDivWrapper">
      <router-link id="homeDivRegistos" class="smallDiv leftMidDiv"  @mouseover.native="startHoverDiv" @mouseleave.native="finishHoverDiv" tag="div" to="/registos"><img src="../assets/registos.jpg" class="imgSmallDiv"><h4>Registos</h4></router-link>
      <router-link id="homeDivEventos" class="smallDiv leftMidDiv" @mouseover.native="startHoverDiv" @mouseleave.native="finishHoverDiv" tag="div" to="/eventos"><img src="../assets/eventos.jpg" class="imgSmallDiv"><h4>Eventos</h4></router-link>
      <router-link id="homeDivConcursos" class="smallDiv leftMidDiv" @mouseover.native="startHoverDiv" @mouseleave.native="finishHoverDiv" tag="div" to="/concursos"><img src="../assets/concursos.jpg" class="imgSmallDiv"><h4>Concursos</h4></router-link>
      <router-link id="homeDivContratos" class="smallDiv" @mouseover.native="startHoverDiv" @mouseleave.native="finishHoverDiv" tag="div" to="/contratos"><img src="../assets/contratos.jpg" class="imgSmallDiv"><h4>Contratos</h4></router-link>
      <router-link id="homeDivPoliticos" class="smallDiv leftMidDiv" @mouseover.native="startHoverDiv" @mouseleave.native="finishHoverDiv" tag="div" to="/politicos"><img src="../assets/politicos.jpg" class="imgSmallDiv"><h4>Políticos</h4></router-link>
      <router-link id="homeDivEmpresarios" class="smallDiv leftMidDiv" @mouseover.native="startHoverDiv" @mouseleave.native="finishHoverDiv" tag="div" to="/empresarios"><img src="../assets/empresarios.jpg" class="imgSmallDiv"><h4>Empresários</h4></router-link>
      <router-link id="homeDivOrganizacoes" class="smallDiv leftMidDiv" @mouseover.native="startHoverDiv" @mouseleave.native="finishHoverDiv" tag="div" to="/organizacoes"><img src="../assets/organizacoes.jpg" class="imgSmallDiv"><h4>Organizações</h4></router-link>
      <router-link id="homeDivCreditados" class="smallDiv" @mouseover.native="startHoverDiv" @mouseleave.native="finishHoverDiv" tag="div" to="/cidadaosCreditados"><img src="../assets/creditados.jpg" class="imgSmallDiv"><h4>Cidadãos Creditados</h4></router-link>  
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    startHoverDiv(e){
      if(e.srcElement.localName == "div"){
        e.srcElement.classList.add("divHover");  
      } else if(e.srcElement.localName == "img"){
        e.srcElement.parentElement.classList.add("divHover");  
      }
    },
    finishHoverDiv(e){
      if(e.srcElement.localName == "div"){
        e.srcElement.classList.remove("divHover");  
      } else if(e.srcElement.localName == "img"){
        e.srcElement.parentElement.classList.remove("divHover");  
      }
    }
  }
}
</script>

<style scoped>
  #divImg {
    width: 95%;
    height: 270px;
    margin: auto;
    margin-top: 25px;
    margin-bottom: 25px;
    border-radius: 15px;
    overflow: hidden;
  }

  #logo {
    height: 250px;
    width: 280px;
    top: -99%;
    left: 22%;
    position: relative;
    border-radius: 20%;
  }

  #logoBackground {
    width: 100%;
    height: 100%;
  }

  #smallDivWrapper {
    width: 95.2%;
    margin: auto;
  }

  .smallDiv {
    width: 22.27%;
    height: 135px;
    float: left;
    margin-top: 10px;
    margin-bottom: 20px;
    border-radius: 15px;
    overflow: hidden;
    transition: transform .2s;
    cursor: pointer;
  }

  .divHover {
    transform: scale(1.2);
  }

  .imgSmallDiv {
    height: 100%;
    width: 100%;
    border-radius: 12px;
  }

  .smallDiv h4 {
    position: relative;
    top: -50%;
    left: 6%;
    color: white;
    font-size: 18px;
    text-align: left;
  }

  .leftMidDiv {
    margin-right: 3.634%;
  }

  h4 {
    width: 275px;
    padding: 5px;
    border-radius: 10px;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  }
</style>