import { h, Component } from 'preact';


export default class GestorHome extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (<section class="section">
          <div class="container has-text-centered">
            <h3 class="has-text-grey-darker is-size-5">Envie sua redação agora mesmo!</h3>
            <br />
            <a class="box-event" href="/estudante/enviar-redacao" >
              <i class="fa fa-file fa-5x"></i>
              <br />
              Enviar Redação
            </a>
          </div>
        </section>)
    }
}