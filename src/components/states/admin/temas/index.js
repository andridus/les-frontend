import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import {LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import { Link } from 'preact-router/match';
import root from 'window-or-global';
import { Message, MessageBox, DatePicker, i18n} from 'element-react';
import locale from 'element-react/src/locale/lang/pt-br'
import 'element-theme-default';
import AdminSubirTema from '../subir_tema';
export default class AdminTemas extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth,
      url: root.url_base+'/api/admin/temas',
      ano: "2018"
    })
    i18n.use(locale);
  }

  formatData(x){
    let m = moment(x, "D/M/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss");
    let m0 = m == "Invalid date" ? " - " : m;
    return (<small> {m0}</small>);

  }
  visualizarOnClick(item){
    root.open("http://novo.letrassolidarias.com.br/"+item.url,"_blank");
  }
  aceitarOnClick(item){
    console.log("aceitar", item)
  }
  removerOnClick(item){
    let that = this;
    if(item.redacoes > 0 ){
      Message({
            type: 'warning',
            message: 'Não pode remover o tema #'+item.id+' já contém '+item.redacoes+' redações!'
          });
      return ;
    }

    MessageBox.msgbox({
      title: 'Remover Tema?',
      message: 'Tem certeza de que deseja remover esse tema?',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(action => {
      console.log(action)
      if(action == "confirm")
      {
          reqwest({
            url: root.url_base+'/api//admin/remover-tema/'+item.id
            , method: 'delete'
            , headers: {
              'Authorization':'Bearer '+that.state.auth.jwt
            }
            , data: {}
            , success: function (resp) {

              Message({
                type: 'success',
                message: (
                  <div>
                    O tema #{item.id} foi REMOVIDO!
                  </div>
                  )
              });
              that.setState({timestamp: new Date().getTime()})
            }
            , error: function(){
              Message({
                type: 'error',
                message: 'Erro no servidor.'
              });
            }
          });

      }else{
        Message({
            type: 'warning',
            message: 'Remover tema #'+item.id+' cancelado!'
          });
      }

    });
  }
  removerTodosOnClick(item){
    console.log("recusar", item)
  }

  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth})
  }

  render() {
     let state = this.state;
    return (
        <div class="container">
          <h1 class="is-size-3">Temas </h1>
          <AdminSubirTema auth={this.state.auth} />
          <br />
          <LesTable auth={this.state.auth}  update={this.state.timestamp} columns={this.state.columns} url={this.state.url} order_id="desc">
            <LesTableColumn type="column" column="id" label="Id" />
            <LesTableColumn type="column" column="tema" label="Tema" />

            <LesTableColumn type="column" column="redacoes" label="Redações" />
            <LesTableColumn type="column" column="criado_em" label="Criado" apply={this.formatData} search_type={"date"} />
              <LesTableButton type="button" label="Visualizar" icon="fas fa-eye" classe="button is-light is-small" title="Visualizar Revisão" onClick={this.visualizarOnClick.bind(this)} />
              <LesTableButton type="button" label="Remover" icon="fas fa-trash" classe="button is-danger is-small" title="Remover Tema" onClick={this.removerOnClick.bind(this)} />

          </LesTable>
        </div>
    );
  }
}
