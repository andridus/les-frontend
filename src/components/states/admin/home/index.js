import { h, Component } from 'preact';
import * as moment from 'moment';
import 'fontawesome';
import * as reqwest from 'reqwest';
import { Message, DatePicker, i18n} from 'element-react';
import 'element-theme-default';
import locale from 'element-react/src/locale/lang/pt-br';
import root from 'window-or-global';

export default class AdminHome extends Component {
  constructor(props){
    super(props);
    moment.locale('pt_br');
    i18n.use(locale);
    let a = moment()
    this.setState({loaded: false, onlines: [], date: a.toDate(), ano: a.format("Y"),
       redacoes:{total: "-", pendentes: "-", revisadas:"-"},
       revisoes:{total: "-", pendentes: "-", aprovadas:"-"},
       usuarios:{total: "-", estudantes: "-", revisores:"-", outros:"-"},
       total_geral:{redacoes: "-", revisoes: "-"},
       ultimas:{revisoes:[], redacoes:[]}})
    this.load_data = this.load_data.bind(this)
    this.load_static_data = this.load_static_data.bind(this)

  }
  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    let onlines = [];
    if(props.onlines){
      Object.keys(props.onlines).map( u =>{
        onlines.push(props.onlines[u])
      })
    }

    this.setState({auth: props.auth, onlines: onlines});
    if(!this.state.loaded && props.auth){
      this.load_data();
      this.load_static_data();
      this.setState({loaded: true});
    }


  }
  load_static_data(){
    let that = this;
    //////////// TOTAL GERAL
      reqwest({
        url: root.url_base+'/api/admin/total-geral/'
        , method: 'post'
        , headers: {
          'Authorization':'Bearer '+that.state.auth.jwt
        }
        , data: {date: that.state.date}
        , success: function (resp) {

          that.setState({total_geral: {redacoes: resp.redacoes, revisoes: resp.revisoes}})
        }
        , error: function(){

          Message({
            type: 'error',
            message: 'Erro no servidor.'
          });
        }})
    //////////// ULTIMAS REVISOES
      reqwest({
        url: root.url_base+'/api/admin/ultimas/'
        , method: 'post'
        , headers: {
          'Authorization':'Bearer '+that.state.auth.jwt
        }
        , data: {date: that.state.date}
        , success: function (resp) {
          that.setState({ultimas: {revisoes: resp.revisoes, redacoes: resp.redacoes}})
        }
        , error: function(){

          Message({
            type: 'error',
            message: 'Erro no servidor.'
          });
        }})
  }
  load_data(){
    let that = this;

if(this.state.ano && this.state.ano.length == 4){
//////////// REDACOES
    reqwest({
      url: root.url_base+'/api/admin/redacoes-ano/'+this.state.ano
      , method: 'post'
      , headers: {
        'Authorization':'Bearer '+that.state.auth.jwt
      }
      , data: {date: that.state.date}
      , success: function (resp) {

        that.setState({redacoes: {pendentes: resp.pendentes, total: resp.redacoes, revisadas: resp.revisadas}})
      }
      , error: function(){

        Message({
          type: 'error',
          message: 'Erro no servidor.'
        });
      }})

///////////////REVISOES
      reqwest({
        url: root.url_base+'/api/admin/revisoes-ano/'+this.state.ano
        , method: 'post'
        , headers: {
          'Authorization':'Bearer '+that.state.auth.jwt
        }
        , data: {date: that.state.date}
        , success: function (resp) {

          that.setState({revisoes: {pendentes: resp.pendentes, total: resp.revisoes, aprovadas: resp.aprovadas}})
        }
        , error: function(){

          Message({
            type: 'error',
            message: 'Erro no servidor.'
          });
        }})
///////////////USUARIOS
      reqwest({
        url: root.url_base+'/api/admin/usuarios-ano/'+this.state.ano
        , method: 'post'
        , headers: {
          'Authorization':'Bearer '+that.state.auth.jwt
        }
        , data: {date: that.state.date}
        , success: function (resp) {

          that.setState({usuarios: {total: resp.total, estudantes: resp.estudantes, revisores: resp.revisores, outros: resp.outros}})
        }
        , error: function(){

          Message({
            type: 'error',
            message: 'Erro no servidor.'
          });
        }})
      }
  }

  render(){

    return (
      <div class="container">
        <main class="column main">
          <div class="level">
            <div class="level-left">
              <div class="level-item">
                <div class="title has-text-primary"><i class="fas fa-tachometer-alt"></i> Meu painel</div>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <DatePicker
                    value={this.state.data}
                    placeholder="Escolha o ano"
                    onChange={date=>{
                      console.log('year DatePicker changed: ', date)
                      if(date){
                        this.setState({data: date, ano: moment(date).format("Y")});
                        this.load_data();
                      }

                    }}
                    selectionMode="year"
                    align="right"
                    />
              </div>
            </div>
          </div>

          <div class="columns is-multiline">
            <div class="column">
              <div class="box notification is-primary">
                <div class="heading">Redações em {this.state.ano}</div>
                <div class="title">{this.state.redacoes.total}</div>
                <div class="level">
                  <div class="level-item">
                    <div class="">
                      <div class="heading">Revisadas</div>
                      <div class="title is-5">{this.state.redacoes.revisadas}</div>
                    </div>
                  </div>
                  <div class="level-item">
                    <div class="">
                      <div class="heading">Pendentes</div>
                      <div class="title is-5">{this.state.redacoes.pendentes}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="box notification is-warning">
                <div class="heading">Revisões em {this.state.ano}</div>
                <div class="title">{this.state.revisoes.total}</div>
                <div class="level">
                  <div class="level-item">
                    <div class="">
                      <div class="heading">Aprovadas</div>
                      <div class="title is-5">{this.state.revisoes.aprovadas}</div>
                    </div>
                  </div>
                  <div class="level-item">
                    <div class="">
                      <div class="heading">Pendentes</div>
                      <div class="title is-5">{this.state.revisoes.pendentes}</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <div class="column">
              <div class="box notification is-info">
                <div class="heading">Usuários</div>
                <div class="title">{this.state.usuarios.total}</div>
                <div class="level">
                  <div class="level-item">
                    <div class="">
                      <div class="heading">Estudantes</div>
                      <div class="title is-5">{this.state.usuarios.estudantes}</div>
                    </div>
                  </div>
                  <div class="level-item">
                    <div class="">
                      <div class="heading">Revisores</div>
                      <div class="title is-5">{this.state.usuarios.revisores}</div>
                    </div>
                  </div>
                  <div class="level-item">
                    <div class="">
                      <div class="heading">Outros</div>
                      <div class="title is-5">{this.state.usuarios.outros}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="columns is-multiline">
            <div class="column">
              <div class="box notification is-danger">
                <div class="heading">Total Geral (Redações / Revisões)</div>
                <div class="title">{this.state.total_geral.redacoes} / {this.state.total_geral.revisoes}</div>
              </div>
            </div>
          </div>

          <div class="columns is-multiline">
            <div class="column is-6">
              <div class="panel">
                <p class="panel-heading">
                  Últimas Revisões
                </p>
                <div class="panel-block">
                  <table class="table is-bordered is-fullwidth">
                    <thead>
                      <tr>
                        <th>
                          Id
                        </th>
                        <th>
                          Revisor
                        </th>
                        <th>
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.ultimas.revisoes.map( rev => {
                        return (<tr>
                          <td>
                            {rev.id}
                          </td>
                          <td>
                            {rev.revisor}
                          </td>
                          <td>
                            {moment(rev.data).format("DD/MM  HH[h]mm[m]")}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="column is-6">
              <div class="panel">
                <p class="panel-heading">
                Últimas Redações
                </p>
                <div class="panel-block">
                  <table class="table is-bordered is-fullwidth">
                    <thead>
                      <tr>
                        <th>
                          Id
                        </th>
                        <th>
                          Autor
                        </th>
                        <th>
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.ultimas.redacoes.map( red => {
                        return (<tr>
                          <td>
                            {red.id}
                          </td>
                          <td>
                            {red.autor}
                          </td>
                          <td>
                            {moment(red.data).format("DD/MM  HH[h]mm[m]")}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="column is-6">
              <div class="panel">
                <p class="panel-heading">
                  Usuários Online
                </p>
                <div class="panel-block">
                  <table class="table is-bordered is-fullwidth">
                    <thead>
                      <tr>
                        <th>
                          Usuário
                        </th>
                        <th>
                          Tipoconta
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.onlines.map( u => {
                        return (<tr>
                          <td>
                            {u.metas[0].name}
                            <span class="tag is-warning" title="Máquinas distintas">{u.metas.length}</span>
                          </td>
                          <td>
                            {u.metas[0].tipoconta}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
}
/*

<div class="column is-4">
  <div class="panel">
    <p class="panel-heading">
      Últimos Online
    </p>
    <div class="panel-block">
      <table class="table is-bordered is-fullwidth">
        <thead>
          <tr>
            <th>
              Usuário
            </th>
            <th>
              Tipoconta
            </th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <td>
                Fulano de Tal
              </td>
              <td>
                TIPOCONTA
              </td>
            </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
<div class="column is-4">
  <div class="panel">
    <p class="panel-heading">
      Erros de Acesso (Ultimos 10)
    </p>
    <div class="panel-block">
      <table class="table is-bordered is-fullwidth">
        <thead>
          <tr>
            <th>
              Usuário
            </th>
            <th>
              Tipoconta
            </th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <td>
                Fulano de Tal
              </td>
              <td>
                TIPOCONTA
              </td>
            </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

*/
