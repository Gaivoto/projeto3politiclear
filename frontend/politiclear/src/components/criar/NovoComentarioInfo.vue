<template>
    <div>
        <div v-show="isCreatingComment">
            <label for="comentario">Comentário:</label><br>
            <textarea name="comentario" cols="30" rows="10" v-model="comentario"></textarea>
            <button @click="comentar">Comentar</button>
            <button @click="toggleComentario">Cancelar</button>
        </div>
        <button v-show="!isCreatingComment" @click="toggleComentario">Criar comentário</button>
    </div>
</template>

<script>
export default {
    name: 'NovoComentarioInfo',
    data(){
        return {
            comentario: "",
            isCreatingComment: false
        }
    },
    methods: {
        comentar(){
            this.$emit('comentar', this.comentario);
            this.isCreatingComment = false;
            this.comentario = "";
        },
        toggleComentario(){
            this.isCreatingComment = !this.isCreatingComment;
        }
    }
}
</script>