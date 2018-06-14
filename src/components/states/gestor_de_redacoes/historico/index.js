import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import {LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import { Link } from 'preact-router/match';
import { route } from 'preact-router';
import style from './style';
import root from 'window-or-global';
import { Message, MessageBox, DatePicker, i18n} from 'element-react';
import locale from 'element-react/src/locale/lang/pt-br'
import 'element-theme-default';

export default class GestorRedHistorico extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth, 
      url: root.url_base+'/api/gestor/historicos',
      ano: "2018",
      items: []
    })
    i18n.use(locale);
    this.reloadHistoricos.bind(this);
  }

  formatData(x){
    let m = moment(x, "D/M/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss");
    let m0 = m == "Invalid date" ? " - " : m;
    return (<small> {m0}</small>);

  }
  visualizarOnClick(item){
    console.log("visualizar", item)
  }
  enviarOnClick(item){
    route('/estudante/enviar-redacao/'+item.id, true)
  }

  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO

    this.setState({auth: props.auth})
    this.reloadHistoricos();
  }
 
  reloadHistoricos(){
    let that = this;
    reqwest({
        url: this.state.url
      , type: 'json'
      , method: 'post'
      , headers: {
        'Authorization':'Bearer '+this.state.auth.jwt
      }
      , data: {$limit: 150, $offset: 0, order$id: "desc"}
      , crossOrigin: true
      })
    .then(function (resp) {
        that.setState({loading: false, items: resp.items});
      })
    .fail(function (err, msg) {
        that.setState({loading: false});
        Message({
          type: "error",
          message: "erro no servidor"
        })
    });

  }
  render() {
     let state = this.state;
     let hist_class = this.state.historico ? style.historico : style.historico+ " "+style.historico_hide;
     let css_hist = this.state.historico ? "is-black" : "is-light"
    return (
        <div class={hist_class}> 
          <div class={"button is-small "+style.btn_hist+" "+css_hist} title="Histórico de Envios" onClick={e => {
              this.setState({historico: !this.state.historico })
              if(this.state.historico){
                this.reloadHistoricos();
              }
            }}>
              <i class="fa fa-clock"></i>
          </div>
          <div class={style.cont}>
            <table class="table is-striped is-fullwidth" style="font-size:12px;">
                <thead>
                  <tr>
                    <th colspan="3" style="text-align:center">
                      Histórico de Envios
                    </th>
                    
                  </tr>
                </thead>
                <tbody>
                  {this.state.items.map( i => {

                    let status = null;
                    switch(i.status){
                      case 1:
                        status = (<div class="tag is-success is-small"> Enviado </div>);
                        break;
                      case 2:
                        status = (<div class="tag is-info is-small"> Erro ao Enviar </div>);
                        break;
                      case 3:
                        status = (<div class="tag is-danger is-small"> Removido </div>);
                        break;
                      case 4:
                        status = (<div class="tag is-info is-small"> Erro ao Remover </div>);
                        break;
                    }
                    return (
                      <tr>
                        <td colspan="2">
                            {i.nome}
                            | <i>{i.tema}</i>
                        </td>
                        <td style="width:90px"> 
                        {status}
                        {this.formatData(i.enviado_em)} </td>
                      </tr>
                      )
                  })}
                  
                </tbody>
              </table>
            </div>
        </div>
    );
  }
}