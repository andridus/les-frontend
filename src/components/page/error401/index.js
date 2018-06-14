import { h, Component } from 'preact';


export default class Error401 extends Component {
    constructor(props){
        super(props);
    }
    render(){
      return (
        <section class="section">
          <div class="container has-text-centered">
            <i class="fa fa-lock fa-5x"></i>
            <h1 class="is-size-3">Página não autorizada!</h1>
            <p>Você não tem permissão para acessar essa página. <br />Se você realmente precisa acessar essa página talvez devesse solicitar permissão ao administrador.</p> 
            <p>Ou pode efetuar o login com uma conta diferente para ter acesso a essa página.
            </p>
          </div>
        </section>)
    }
}