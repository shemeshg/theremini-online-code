<template>
    <p>
        <input class="w3-check" type="checkbox" 
            :checked="value" @input="$emit('input', $event.target.checked)"        
        >


        <label>{{name}}</label>
    </p>
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class W3Checkbox extends Vue {

    @Prop(String) name!: string
    @Prop(Boolean) value!: boolean

}

</script>