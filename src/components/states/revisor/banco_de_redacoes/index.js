import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import {Button, LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import { Link } from 'preact-router/match';
import { route } from 'preact-router';
import { MessageBox, Message, Popover } from 'element-react';
import 'element-theme-default';
import root from 'window-or-global';
export default class RevisorBancoDeRedacoes extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth,
      url: root.url_base+'/api/revisor/banco-de-redacoes'
    })
  }
  formatRevisor(x, item){
    return (<Link href={"/revisor/revisor/"+item.revisor_id}>
              <span> {x} </span>
            </Link>)

  }
  formatAutor(x, item){
    return (<Link href={"/revisor/estudante/"+item.autor_id}>
              <span> {x} </span>
            </Link>)
  }
  formatSerie(x, item){
    let serie = parseInt(item.serie);
      let ano_atual = new Date();
      ano_atual = ano_atual.getUTCFullYear();
      if(typeof serie != NaN){
          serie = (ano_atual - serie + 1)+"º Ano";
      }else{
        serie = "";
      }
    return serie

  }
  formatStatus(x, item){
    switch(x) {
      case "Revisada 1x":
        return (<span class="tag is-warning">{x}</span>);
      case "Publicado":
        return (<span class="tag is-success">{x}</span>);
      default:
        return x;
    }

  }
  formatData(x){
    let m = moment(x, "D/M/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss");
    let m0 = m == "Invalid date" ? " - " : m;
    return (<small> {m0}</small>);

  }
  formatPopoverRevisor(x,item){
  let nt = ( <div>
        <b> Revisões: {item.revisoes ? item.revisoes : "Nenhuma" } </ b>  <br />
        <b> Entrou: {this.formatData(item.entrou)} </ b>  <br />
      </div>)
  return (<Popover placement="top-start" width="200" trigger="hover" content={nt}>
      <span>{this.formatRevisor(x, item)}</span>
    </Popover>)
   }
   formatPopoverAutor(x,item){
      let serie = parseInt(item.autor_serie);
      let ano_atual = new Date();
      ano_atual = ano_atual.getUTCFullYear();
      if(typeof serie != NaN){
          serie = ano_atual - serie + 1;
      }else{
        serie = "";
      }
      let nt = ( <div>
          <b> Escola: </ b> {item.autor_escola} <br />
          <b> Turma: </ b> {item.autor_turma} <br />
          <b> Ano: </ b> {item.autor_serie} ({serie}º Ano) <br />
        </div>)
      return (<Popover placement="top-start" width="200" trigger="hover" content={nt}>
          <span>{this.formatAutor(x, item)}</span>
        </Popover>)
   }
  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth})
  }

  handleVisualizar(item){
    //route("/revisor/revisar/"+item.id)
    let url = "/revisor/revisar/"+item.id;
    root.open(url,"_blank")
  }
  handleDownload(item){
    let url = item.arquivo;
    if(item.arquivo && item.arquivo[0]=="/"){
      url = "http://novo.letrassolidarias.com.br/"+item.arquivo
    }
    root.open(url,"_blank")
  }


  render() {
    return (
        <div class="container">
            <h1 class="is-size-3">Banco de Redações </h1>
            <LesTable auth={this.state.auth}  columns={this.state.columns} url={this.state.url} order={{id: "desc", revisoes:"asc"}}>
              <LesTableColumn type="column" column="id" label="Id" />
              <LesTableColumn type="column" column="autor" label="Autor" apply={this.formatAutor.bind(this)}/>
              <LesTableColumn type="column" column="tema" label="Tema" />
              <LesTableColumn type="column" column="escola" label="Escola" />
              <LesTableColumn type="column" column="turma" label="Turma" />
              <LesTableColumn type="column" column="status_red" label="Status" apply={this.formatStatus.bind(this)}>
                <LesTableQueryOpt type="filter" label="Publicado" value="Publicado" />
                <LesTableQueryOpt type="filter" label="Revisada 1x" value="Revisada 1x" />
              </LesTableColumn>
              <LesTableColumn type="column" column="serie" label="Série" apply={this.formatSerie.bind(this)}>
                <LesTableQueryOpt type="filter" label="1º Ano" value="2018" />
                <LesTableQueryOpt type="filter" label="2º Ano" value="2017" />
                <LesTableQueryOpt type="filter" label="3º Ano" value="2016" />
                <LesTableQueryOpt type="filter" label="4º Ano" value="2015" />
                <LesTableQueryOpt type="filter" label="5º Ano" value="2014" />
              </LesTableColumn>
              <LesTableColumn type="column" column="data" label="Enviado" apply={this.formatData} search_type={"date"}/>
              <LesTableButton type="button" label="Visualizar" icon="fas fa-pencil-alt" classe="button is-warning is-small" title="Pegar Revisao" onClick={this.handleVisualizar.bind(this)} />
              <LesTableButton type="button" label="Aceitar" icon="fas fa-download" classe="button is-light is-small" title="Baixar Redação" onClick={this.handleDownload.bind(this)} />
            </LesTable>
        </div>
    );
  }
}
