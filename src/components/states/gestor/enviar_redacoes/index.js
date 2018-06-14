import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import { Link } from 'preact-router/match';
import { Popover, Select, i18n, Loading, Message} from 'element-react';
import 'element-theme-default';
import locale from 'element-react/src/locale/lang/pt-br'
import GestorEscolherTemas from '../escolher_temas';
import GestorSubirRedacao from '../subir_redacao';
import GestorHistorico from '../historico';
import root from 'window-or-global';
export default class EnviarRedacoes extends Component {
  constructor(props){
    super(props);
    let d = new Date();
    let year = d.getFullYear();
    let anos = [];
    for(let i = 0 ; i <= (year - 2014 ); i++)
    {
      anos.push({label: 1+i+'º Ano', value: 2018-i});
    }
    this.setState({
      auth: props.auth, 
      url_turmas: root.url_base+'/api/gestor/turmas',
      url: root.url_base+'/api/gestor/estudantes',
      turmas: [],
      turma: null,
      anos: anos,
      serie: year,
      estudantes: [],
      count: 0,
      loading: false
    })
    i18n.use(locale);

  }
  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    console.log("receive", props)
    let auth_before = this.state.auth;
    this.setState({auth: props.auth, columns: props.columns});
      this.handleGetTurmas();
  }
  onTemaSelected(tema){
    this.setState({tema: tema});
  }
  handleGetTurmas(){
    let that = this;
    that.setState({loading: true});
    reqwest({
        url: this.state.url_turmas
      , type: 'json'
      , method: 'post'
      , headers: {
        'Authorization':'Bearer '+this.state.auth.jwt
      }
      , data: {$limit: 150, $offset: 0, order$turma: "asc"}
      , crossOrigin: true
      })
    .then(function (resp) {
        that.setState({loading: false, turmas: resp.items, turma: resp.items[0].id});
        that.handleGetEstudantes();
      })
    .fail(function (err, msg) {
        that.setState({loading: false});
        Message({
          type: "danger",
          message: "erro no servidor"
        })
    });

  }
  handleGetEstudantes(){
    let that = this;
    that.setState({loading: true});
    reqwest({
        url: this.state.url
      , type: 'json'
      , method: 'post'
      , headers: {
        'Authorization':'Bearer '+this.state.auth.jwt
      }
      , data: {$limit: 150, $offset: 0, order$nome: "asc", $turma: this.state.turma, $serie: this.state.serie}
      , crossOrigin: true
      })
    .then(function (resp) {
        that.setState({loading: false, estudantes: resp.items, count: resp.items.length});
          
      })
    .fail(function (err, msg) {
        that.setState({loading: false});
    });

  }
 updateHistorico(){
  this.setState({historico: moment().unix()})
 }
 render() {
    return (
      <div >
        {
          this.state.loading && <Loading fullscreen={true} text="Aguarde. Carregando estudantes..." />
        }
        <div class="container">
          <div class="column">
            <h1 class="is-size-3">Enviar Redações </h1>
            
          </div>
        </div>
        <GestorHistorico auth={this.props.auth} historico={this.state.historico} />
        <div class="container">
          <div class="column">
            <h1 class="has-text-weight-bold is-size-5">Turma</h1>
            <select class="button select" value={this.state.turma} placeholder="Selecionar" onChange={ ev => {
                       console.log(ev.target.value)
                       this.setState({turma:ev.target.value});
                       this.handleGetEstudantes();
                    }}>
                <option disabled={true} selected={true} value="">Selecionar</option>
               {
                this.state.turmas.map(t => {
                  return <option key={t.id} value={t.id}>{t.turma} </option>
                })
              }
            </select>
            
          </div>
        </div>
        <div class="container">
          <div class="column">
            <h1 class="has-text-weight-bold is-size-5">Séries</h1>
            <div class="field has-addons">
              <p class="control">
                { this.state.anos.map( m => {
                  let selected = m.value == this.state.serie ? "is-dark" : "is-light"
                  return (
                    <div class={"button "+selected} onClick={ ev => {
                       this.setState({serie: m.value});
                       this.handleGetEstudantes();
                    }} >
                      <span class="np">{m.label}</span>
                    </div>

                    )
                })


                }
              </p>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="column">
            <div class="has-text-primary is-uppercase has-text-weight-semibold" >
              Escolher Tema
            </div>
          </div>
        </div>
        <div class="container">
          <div class="column">
            <GestorEscolherTemas auth={this.props.auth} onTemaSelected={this.onTemaSelected.bind(this)} />
          </div>
        </div>
        <div class="container">
          <div class="column">
            <div class="has-text-primary is-uppercase has-text-weight-semibold" >
              Enviar redação para estudantes
              <br />
              
              
                 {this.state.tema && <div>
                  <b class="has-text-black">Proposta Selecionada</b>
                  <span class="has-text-grey" style="margin-left:10px">
                  {this.state.tema.tema}</span>
                  </div>}
                 {!this.state.tema && <div> <span class="has-text-grey" style="margin-left:10px">
                  Nenhum tema selecionado</span></div>}
              
            </div>
          </div>
        </div>
        {this.state.estudantes.length ? <div class="container">
          <div class="column">
            <table class="table is-striped is-bordered is-fullwidth">
              <thead>
                <tr>
                  <th key="id" >
                    Id
                  </th>
                  <th key="nome" >
                    Estudante
                  </th>
                  <th>
                    
                  </th>
                  
                </tr>
              </thead>
              <tbody>
                {this.state.estudantes.map( (e,i) =>{

                  return (
                     <tr key={e.id} class="">
                      <td>{i+1}</td>
                      <td>{e.nome}</td>
                      <td>
                        <GestorSubirRedacao auth={this.props.auth} tema={this.state.tema} est={e} onUpdate={this.updateHistorico.bind(this)}/>
                      </td>
                    </tr>

                    )
                })}
               
              </tbody>
            </table>
          </div>
        </div> : <div class="container">
          <div class="column">
            <span>Não existem estudantes nessa turma e nessa série</span>
          </div>
        </div>}
        
      </div>)
}
}
