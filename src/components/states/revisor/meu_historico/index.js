import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import {Button, LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import { Link } from 'preact-router/match';
import { route } from 'preact-router';
import { MessageBox, Message, Popover } from 'element-react';
import 'element-theme-default';
import root from 'window-or-global';
export default class RevisorMeuHistorico extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth,
      url: root.url_base+'/api/revisor/meu_historico'


    })
    moment.locale('pt_br');
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
      console.log(serie);
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
   formatPopoverTempo(x,item){
       var x = new moment(item.visualizado_em, "D/M/YYYY H:m:s")
       var y = new moment(item.fechado_em, "D/M/YYYY H:m:s")
       var duration = moment.duration(x.diff(y));
      return (<span>{duration.humanize()}</span>)
   }
  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth})
  }
  render() {
    return (
        <div class="container">
            <h1 class="is-size-3">Meu Histórico </h1>
            <Link href="/revisor/minhas-revisoes"> Minhas Revisões </Link>
            <LesTable auth={this.state.auth}  columns={this.state.columns} url={this.state.url} order_id="desc">
              <LesTableColumn type="column" column="autor" label="Autor" apply={this.formatPopoverAutor.bind(this)}/>
              <LesTableColumn type="column" column="tema" label="Tema" />
              <LesTableColumn type="column" column="data" label="Enviado" apply={this.formatData} search_type={"date"}/>
            <LesTableColumn type="column" column="visualizado_em" label="Visualizado em" apply={this.formatData} search_type={"date"}/>
            <LesTableColumn type="column" column="visualizado_em" label="tempo de visualização" apply={this.formatPopoverTempo.bind(this)} search_type={"off"}/>
            </LesTable>
        </div>
    );
  }
}
