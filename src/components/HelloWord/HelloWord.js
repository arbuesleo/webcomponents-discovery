import template from './HelloWord.html'

class HelloWordNative extends HTMLElement {    
    
    constructor(){
        super();
    }

    connectedCallback () {
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = template;
    }

  }
  

  customElements.define('hello-word-native', HelloWordNative);