import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import { LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import { Link } from 'preact-router/match';
import { route } from 'preact-router';
import { MessageBox, Message, Popover } from 'element-react';
import 'element-theme-default';
import root from 'window-or-global';
export default class RevisorMinhasRevisoes extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth,
      url: root.url_base+'/api/revisor/minhas-revisoes',
      timestamp: 0


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
      case "Recusada":
        return (<span class="tag is-danger">{x}</span>);
      default:
        return x;
    }

  }
  formatSerie(x, item){
    let serie = parseInt(item.serie);
    let ano_atual = new Date();
    ano_atual = ano_atual.getUTCFullYear();
    if(serie){
        serie = ano_atual - serie + 1;
    }else{
      serie = "";
    }
    if(serie){
      return  <div>{serie}º Ano</div>
    }else{
      return  <div></div>
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
    route("/revisor/revisar/"+item.redacao_id)
  }
  handleDevolver(item){
    let that = this;
    //route("/revisor/revisar/"+item.redacao_id)
    MessageBox.confirm(<div>
      <p> Saiba que ao devolver essa redação você perderá todo o seu progresso. Tem certeza de que deseja devolver essa redação?</p>
      </div>, 'Devolver redação?', {
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
      type: 'warning'
    }).then(() => {
      console.log("here");
      reqwest({
        url: root.url_base+'/api/revisor/devolver-redacao/'
        , method: 'post'
        , headers: {
          'Authorization':'Bearer '+that.state.auth.jwt
        }
        , data: {id: item.id}
        , success: function (resp) {
          root.messages.callback(
            /*<MessageBar
              messageBarType={MessageBarType.success}
            >
              <small>Redação #{item.redacao_id} devolvida para o Banco de Redações.</small>
            </MessageBar>*/
          );
          let date = new Date();
          that.setState({timestamp: date.getTime()})
          
        }
        , error: function(error){
          root.messages.callback(
           /* <MessageBar
              messageBarType={MessageBarType.severeWarning}
            >
              <small>Não foi possível devolver essa redação.</small>
            </MessageBar>*/
          );
        }
      })
    }).catch(e=>{});
  }
  render() {
    return (
        <div class="container">
            <h1 class="is-size-3">Minhas Revisões </h1>
            <Link href="/revisor/meu-historico"> Meu Histórico </Link>
            <LesTable auth={this.state.auth}  update={this.state.timestamp} columns={this.state.columns} url={this.state.url} order_id="desc">
              <LesTableColumn type="column" column="id" label="Id" />
              <LesTableColumn type="column" column="autor" label="Autor" apply={this.formatPopoverAutor.bind(this)}/>
              <LesTableColumn type="column" column="tema" label="Tema" />
              <LesTableColumn type="column" column="turma" label="Turma"/>
              <LesTableColumn type="column" column="serie" label="Série" apply={this.formatSerie}>
                <LesTableQueryOpt type="filter" label="1º Ano" value="2018" />
                <LesTableQueryOpt type="filter" label="2º Ano" value="2017" />
                <LesTableQueryOpt type="filter" label="3º Ano" value="2016" />
                <LesTableQueryOpt type="filter" label="4º Ano" value="2015" />
              </LesTableColumn>
              <LesTableColumn type="column" column="status" label="Status" apply={this.formatStatus}>
                <LesTableQueryOpt type="filter" label="Pendente" value="Pendente" />
                <LesTableQueryOpt type="filter" label="Aprovado" value="Aprovado" />
                <LesTableQueryOpt type="filter" label="Em Revisão" value="Em Revisão" />
                <LesTableQueryOpt type="filter" label="Recusado" value="Recusado" />
              </LesTableColumn>
              <LesTableColumn type="column" column="data" label="Data" apply={this.formatData} />

              <LesTableColumn type="column" column="nota" label="Nota" />
              <LesTableButton type="button" label="Visualizar" icon="fas fa-eye" classe="button is-light is-small" title="Visualizar Redação" onClick={this.handleVisualizar.bind(this)} onClick={this.handleVisualizar.bind(this)}  />
              <LesTableButton type="button" label="Continuar Revisão" icon="fas fa-pencil-alt" classe="button is-warning is-small" title="Continuar Redação" onClick={this.handleVisualizar.bind(this)} only_column="status" only_values={["Em Revisão"]}/>
              <LesTableButton type="button" label="Devolver" icon="fas fa-times" classe="button is-danger is-small" title="Devolver Redação" onClick={this.handleDevolver.bind(this)} only_column="status" only_values={["Em Revisão"]}/>
            </LesTable>
        </div>
    );
  }
}
