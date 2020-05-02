<template>
    <p>      
    <label class="w3-text-grey">{{name}}</label>
    <input class="w3-input w3-border" type="number"  
        v-bind:value="value"
        v-on:input="$emit('input', $event.target.value)"
     >
    </p>
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class W3InputNumber extends Vue {

    @Prop(String) name!: string
    @Prop(String) value!: string
    

}

</script>