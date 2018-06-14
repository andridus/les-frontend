import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import {LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import {route} from 'preact-router';
import { Link } from 'preact-router/match';
import { MessageBox, Message, Popover} from 'element-react';
import 'element-theme-default';
import root from 'window-or-global';


export default class AdminRevisoesPendentes extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth,
      url: root.url_base+'/api/admin/revisoes-pendentes'


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
  visualizarOnClick(item){
    route('/admin/revisao/'+item.redacao_id+'/visualizar', true);
  }
  aceitarOnClick(item){
    let that = this;
    MessageBox.msgbox({
      title: 'Aceitar Revisão?',
      message: ' Ao aceitar essa revisão, ela estará disponível para que o estudante possa visualizar. Tem certeza de que deseja aceitar essa revisão? ',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(action => {
      if(action == "confirm")
      {
        reqwest({
          url: root.url_base+'/api/admin/aceitar-revisao/'+item.id
          , method: 'post'
          , headers: {
            'Authorization':'Bearer '+that.state.auth.jwt
          }
          , data: {obsadmrevisoes: ''}
          , success: function (resp) {

            Message({
              type: 'success',
              message: (
                <div>
                  A revisão #{item.id} de
                  <b> {item.revisor}</b> foi ACEITA!
                </div>
                )
            });
            that.setState({url: that.state.url})
          }
          , error: function(){
            Message({
              type: 'error',
              message: 'Erro no servidor.'
            });
          }
        });
      }

    });

  }
  recusarOnClick(item){
    let that = this;
    MessageBox.msgbox({
      title: 'Recusar Revisão?',
      message: ' Recusando essa revisão ela irá retornar ao revisor. Tem certeza de que deseja RECUSAR essa revisão?',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(action => {
      if(action == "confirm")
      {
        MessageBox.prompt('É importante que você escreva uma observação antes', 'Tip', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancelar',
        }).then(({ value }) => {
          reqwest({
            url: root.url_base+'/api/admin/rejeitar-revisao/'+item.id
            , method: 'post'
            , headers: {
              'Authorization':'Bearer '+that.state.auth.jwt
            }
            , data: {obsadmrevisoes: value}
            , success: function (resp) {

              Message({
                type: 'warning',
                message: (
                  <div>
                    A revisão #{item.id} de
                    <b> {item.revisor}</b> foi RECUSADA!
                  </div>
                  )
              });
              that.setState({url: that.state.url})
            }
            , error: function(){
              Message({
                type: 'error',
                message: 'Erro no servidor.'
              });
            }
          });
        }).catch(() => {
          Message({
            type: 'warning',
            message: 'Recusar revisão #'+item.id+' cancelada!'
          });
        });
      }

    });
  }
  aceitarTodosOnClick(item){
    let ids = item.map((f)=>{return f.id});
    let ids1 = ids.join(",")
    let that = this;
    MessageBox.msgbox({
      title: 'Aceitar '+ids.length+' Revisões?',
      message: ' Ao aceitar estas '+ids.length+' revisões, elas estarão disponíveis para que o estudante possa visualizar. Tem certeza de que deseja aceitar estas revisões em lote? ',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(action => {
      if(action == "confirm")
      {
        reqwest({
          url: root.url_base+'/api/admin/aceitar-revisoes/'
          , method: 'post'
          , headers: {
            'Authorization':'Bearer '+that.state.auth.jwt
          }
          , data: {ids: ids1, obsadmrevisoes: ''}
          , success: function (resp) {

            Message({
              type: 'success',
              message: (
                <div>
                  As revisões #{ids1} de
                  <b> {item[0].revisor}</b> foram ACEITAS!
                </div>
                )
            });
            that.setState({url: that.state.url})
          }
          , error: function(){
            Message({
              type: 'error',
              message: 'Erro no servidor.'
            });
          }
        });
      }

    });
  }
  recusarTodosOnClick(item){
    let ids = item.map((f)=>{return f.id});
    let ids1 = ids.join(",")
    let that = this;
    MessageBox.msgbox({
      title: 'Recusar '+ids.length+' Revisões ?',
      message: ' Recusando estas '+ids.length+' Revisões, irão retornar aos revisores. Tem certeza de que deseja RECUSAR estas revisões em lote?',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(action => {
      if(action == "confirm")
      {
        MessageBox.prompt('É importante que você escreva uma observação antes', 'Tip', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancelar',
        }).then(({ value }) => {
          reqwest({
            url: root.url_base+'/api/admin/rejeitar-revisoes/'
            , method: 'post'
            , headers: {
              'Authorization':'Bearer '+that.state.auth.jwt
            }
            , data: {ids: ids1, obsadmrevisoes: value}
            , success: function (resp) {

              Message({
                type: 'success',
                message: (
                  <div>
                    As revisões #{ids1} de
                    <b> {item[0].revisor}</b> foram RECUSADAS!
                  </div>
                  )
              });
              that.setState({url: that.state.url})
            }
            , error: function(){
              Message({
                type: 'error',
                message: 'Erro no servidor.'
              });
            }
          });
        }).catch(() => {
          Message({
            type: 'warning',
            message: 'Recusar revisão cancelada!'
          });
        });
      }

    });
  }

  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth})
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
      let serie = parseInt(item.serie);
      let ano_atual = new Date();
      ano_atual = ano_atual.getUTCFullYear();
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
  render() {
    return (
        <div class="container">
            <h1 class="is-size-3">Revisões Pendentes </h1>
            <br />
            <LesTable auth={this.state.auth}  columns={this.state.columns} url={this.state.url} order_id="desc">
              <LesTableColumn type="column" column="id" label="Id" />
              <LesTableColumn type="column" column="revisor" label="Revisor" apply={this.formatPopoverRevisor.bind(this)} />
              <LesTableColumn type="column" column="autor" label="Autor" apply={this.formatPopoverAutor.bind(this)}/>
              <LesTableColumn type="column" column="tema" label="Tema" />
              <LesTableColumn type="column" column="status" label="Status" apply={this.formatStatus}>
                <LesTableQueryOpt type="filter" label="Pendente" value="Pendente" />
              </LesTableColumn>
              <LesTableColumn type="column" column="data" label="Enviado" apply={this.formatData} search_type={"date"}/>
              <LesTableColumn type="column" column="nota" label="Nota" />

              <LesTableButton type="selection" label="Selecionar" classe="button is-light is-small" title="Selecionar" onClick={this.recusarOnClick.bind(this)} />
              <LesTableButton type="button" label="Visualizar" icon="fas fa-eye" classe="button is-light is-small" title="Visualizar Revisão" onClick={this.visualizarOnClick.bind(this)} />
              <LesTableButton type="button" label="Aceitar" icon="fas fa-check" classe="button is-success is-small" title="Aceitar Revisão" onClick={this.aceitarOnClick.bind(this)} />
              <LesTableButton type="button" label="Recusar" icon="fas fa-times" classe="button is-danger is-small" title="Recusar Revisão" onClick={this.recusarOnClick.bind(this)} />

              <LesTableButton type="button_all" label="Aceitar" icon="fas fa-check" classe="button is-success is-small" title="Aceitar Revisões Selecionadas" onClick={this.aceitarTodosOnClick.bind(this)} />
              <LesTableButton type="button_all" label="Recusar" icon="fas fa-times" classe="button is-danger is-small" title="Recusar Revisões" onClick={this.recusarTodosOnClick.bind(this)} />


            </LesTable>
        </div>
    );
  }
}
