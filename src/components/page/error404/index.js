import { h, Component } from 'preact';


export default class Error404 extends Component {
    constructor(props){
        super(props);
    }
    render(){
        console.log("entrou aqui");
      return (
        <section class="section">
          <div class="container has-text-centered">
            <i class="fa fa-times fa-5x"></i>
            <h1 class="is-size-3">Página não encontrada!</h1>
            <p>A página que você tentou acessar não existe.</p> 
          </div>
        </section>)
    }
}