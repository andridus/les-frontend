import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import {Button, LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import { Link } from 'preact-router/match';
import { Popover } from 'element-react';
import 'element-theme-default';
import root from 'window-or-global';

export default class AdminRedacoes extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth,
      url: root.url_base+'/api/admin/redacoes'


    })
  }
  formatRevisor(x, item){
    return (<Link href={"/admin/revisor/"+item.revisor_id}>
              <span> {x} </span>
            </Link>)

  }
  formatAutor(x, item){
    return (<Link href={"/admin/estudante/"+item.autor_id}>
              <span> {x} </span>
            </Link>)

  }
  formatStatus(x){
    switch(x) {
      case "Pendente":
        return (<span class="tag is-warning">{x}</span>);
      case "Aprovado":
        return (<span class="tag is-success">{x}</span>);
      case "Em Revisão":
        return (<span class="tag is-info">{x}</span>);
      case "Recusado":
        return (<span class="tag is-danger">{x}</span>);
      default:
        return x;
    }

  }
  formatData(x){
    let m = moment(x, "D/M/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss");
    let m0 = m == "Invalid date" ? " - " : m;
    return (<small> {m0}</small>);

  }
  formatMedia(x){
    if(x!= null && x.length>3){
      return parseFloat(x).toFixed(0);
    }else{
      return "-";
    }
  }
  formatPopoverAutor(x,item){
    let serie = parseInt(item.serie);
    let ano_atual = new Date();
    ano_atual = ano_atual.getUTCFullYear();
    console.log(serie);
    if(typeof serie != NaN){
        serie = ano_atual - serie + 1;
    }else{
      serie = "";
    }
    let nt = ( <div>
        <b> Escola: </ b> {item.escola} <br />
        <b> Turma: </ b> {item.turma} <br />
        <b> Ano: </ b> {item.serie} ({serie}º Ano) <br />
      </div>)
    return (<Popover placement="top-start" width="200" trigger="hover" content={nt}>
        <span>{this.formatAutor(x, item)}</span>
      </Popover>)
 }
 formatPopoverMedia(x,item){
  let notas = item.notas ? item.notas.split(",") : null;
  let nt = notas ? notas.join(" + ") : null
  return (<Popover placement="top-start"  width="200" trigger="hover" content={nt}>
      <span>{this.formatMedia(x)}</span>
    </Popover>)
 }
 visualizarOnClick(item){
   let url = item.arquivo;
   if(item.arquivo && item.arquivo[0]=="/"){
     url = "http://novo.letrassolidarias.com.br/"+item.arquivo
   }
   root.open(url,"_blank")
 }
  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth})
  }
  render() {
    return (
        <div class="container">
            <h1 class="is-size-3">Redações </h1>
            <br />
            <LesTable auth={this.state.auth}  columns={this.state.columns} url={this.state.url}>
              <LesTableColumn type="column" column="id" label="Id" />

              <LesTableColumn type="column" column="autor" label="Autor" apply={this.formatPopoverAutor.bind(this)}/>
              <LesTableColumn type="column" column="escola" label="Escola"/>
              <LesTableColumn type="column" column="tema" label="Tema" />
              <LesTableColumn type="column" column="status" label="Status" apply={this.formatStatus}>
                <LesTableQueryOpt type="filter" label="Aprovado" value="Aprovado" />
              </LesTableColumn>
              <LesTableColumn type="column" column="revisoes" label="Revisões"/>

              <LesTableColumn type="column" column="media" label="Nota" apply={this.formatMedia} apply={this.formatPopoverMedia.bind(this)}/>
              <LesTableColumn type="column" column="data" label="Enviado" apply={this.formatData} search_type={"date"}/>

              <LesTableButton type="button" label="Visualizar" icon="fas fa-eye" classe="button is-light is-small" title="Visualizar Revisão" onClick={this.visualizarOnClick.bind(this)} />
            </LesTable>
        </div>
    );
  }
}
