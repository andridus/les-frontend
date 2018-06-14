import { h, Component } from 'preact';


import EstudanteEscolherTemas from '../escolher_temas';
import EstudanteSubirRedacao from '../subir_redacao';
import { route } from 'preact-router';

export default class EstudanteEnviarRedacao extends Component{
  constructor(props){
    super(props);
    let tema = null;
    this.setState({tema_:props.tema});
    this.onTemaSelected = this.onTemaSelected.bind(this);
  }

  onTemaSelected(tema){
    this.setState({tema: tema})
  }
  
  render(props){
    console.log("tema",props, this.state)
    return (
        <section class="section">
          <div class="container">
            <h5 class="is-size-4 title"> Enviar redação</h5>
            <div class="has-text-primary is-uppercase has-text-weight-semibold">
              Escolher Tema
            </div>
            <EstudanteEscolherTemas auth={this.props.auth} onTemaSelected={this.onTemaSelected} tema={props.tema}/>
            <EstudanteSubirRedacao auth={this.props.auth} tema={this.state.tema}/>
          </div>
        </section>
      )
  }
}