import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import {LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import { Link } from 'preact-router/match';
import { route } from 'preact-router';
import { MessageBox, Message, Popover} from 'element-react';
import 'element-theme-default';
import root from 'window-or-global';

export default class AdminRedacoesPendentes extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth,
      url: root.url_base+'/api/admin/redacoes-pendentes'


    })
  }
  formatAutor(x, item){
    return (<Link href={"/admin/estudante/"+item.autor_id}>
              <span> {x} </span>
            </Link>)

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
 formatPopoverMedia(x,item){
  let notas = item.notas ? item.notas.split(",") : null;
  let nt = notas ? notas.join(" + ") : null
  return (<Popover placement="top-start" title="Notas das Revisões" width="200" trigger="hover" content={nt}>
      <span>{this.formatMedia(x)}</span>
    </Popover>)
 }
  formatData(x){
    let m = moment(x, "D/M/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss");
    let m0 = m == "Invalid date" ? " - " : m;
    return (<small> {m0}</small>);

  }
  visualizarOnClick(item){
    let url = item.arquivo;
    if(item.arquivo && item.arquivo[0]=="/"){
      url = "http://novo.letrassolidarias.com.br/"+item.arquivo
    }
    root.open(url,"_blank")
  }
  aceitarOnClick(item){
    let that = this;
    MessageBox.msgbox({
      title: 'Aceitar Redação?',
      message: ' Ao aceitar essa redação ela estará disponível no banco de redações. Tem certeza de que deseja aceitar essa redação? ',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(action => {
      if(action == "confirm")
      {
        reqwest({
          url: root.url_base+'/api/admin/aceitar-redacao/'+item.id
          , method: 'post'
          , headers: {
            'Authorization':'Bearer '+that.state.auth.jwt
          }
          , data: {obsadm: ''}
          , success: function (resp) {

            Message({
              type: 'success',
              message: (
                <div>
                  A redação #{item.id} de
                  <b> {item.autor}</b> foi ACEITA!
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
      title: 'Recusar Redação?',
      message: 'Ao recusar esta redação ela retornará para o estudante ficando INDISPONÍVEL para o Banco de Redações. Tem certeza de que deseja RECUSAR essa redação?',
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
            url: root.url_base+'/api/admin/rejeitar-redacao/'+item.id
            , method: 'post'
            , headers: {
              'Authorization':'Bearer '+that.state.auth.jwt
            }
            , data: {obsadm: value}
            , success: function (resp) {
              route("/admin/redacoes-pendentes")
              Message({
                type: 'warning',
                message: (
                  <div>
                    A redação #{item.id} de
                    <b> {item.autor}</b> foi RECUSADA!
                  </div>
                  )
              });

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
        });;
      }

    });
  }
  aceitarTodosOnClick(item){
    let ids = item.map((f)=>{return f.id});
    let ids1 = ids.join(",")
    let that = this;
    MessageBox.msgbox({
      title: 'Aceitar '+ids.length+' Redações?',
      message: ' Ao aceitar estas '+ids.length+' redações, elas estarão disponíveis para o banco de redações. Tem certeza de que deseja aceitar estas redações em lote? ',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(action => {
      if(action == "confirm")
      {
        reqwest({
          url: root.url_base+'/api/admin/aceitar-redacoes/'
          , method: 'post'
          , headers: {
            'Authorization':'Bearer '+that.state.auth.jwt
          }
          , data: {ids: ids1, obsadm: ''}
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
      title: 'Recusar '+ids.length+' Redações ?',
      message: ' Recusando estas '+ids.length+' redações, irão retornar aos estudantes. Tem certeza de que deseja RECUSAR estas redações em lote?',
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
            url: root.url_base+'/api/admin/rejeitar-redacoes/'
            , method: 'post'
            , headers: {
              'Authorization':'Bearer '+that.state.auth.jwt
            }
            , data: {ids: ids1, obsadm: value}
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
            message: 'Recusar revisão #'+item.id+' cancelada!'
          });
        });
      }

    });
  }

  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth})
  }
  render() {
    return (
        <div class="container">
            <h1 class="is-size-3">Redacoes Pendentes </h1>
            <br />
            <LesTable auth={this.state.auth}  columns={this.state.columns} url={this.state.url} order_id="desc">
              <LesTableColumn type="column" column="id" label="Id" />
              <LesTableColumn type="column" column="autor" label="Autor" apply={this.formatPopoverAutor.bind(this)}/>
              <LesTableColumn type="column" column="escola" label="Escola"/>
              <LesTableColumn type="column" column="turma" label="Turma"/>
              <LesTableColumn type="column" column="serie" label="Série" apply={this.formatSerie}>
                <LesTableQueryOpt type="filter" label="1º Ano" value="2018" />
                <LesTableQueryOpt type="filter" label="2º Ano" value="2017" />
                <LesTableQueryOpt type="filter" label="3º Ano" value="2016" />
                <LesTableQueryOpt type="filter" label="4º Ano" value="2015" />
              </LesTableColumn>
              <LesTableColumn type="column" column="tema" label="Tema" />
              <LesTableColumn type="column" column="status" label="Status" apply={this.formatStatus}>
                <LesTableQueryOpt type="filter" label="Aprovado" value="Aprovado" />
              </LesTableColumn>
              <LesTableColumn type="column" column="data" label="Enviado" apply={this.formatData} search_type={"date"}/>

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
