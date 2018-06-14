import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import {LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import { Link } from 'preact-router/match';
import { route } from 'preact-router';

import { Message, MessageBox, DatePicker, i18n} from 'element-react';
import locale from 'element-react/src/locale/lang/pt-br'
import 'element-theme-default';
import root from 'window-or-global';
export default class EstudanteTemas extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth, 
      url: root.url_base+'/api/estudante/temas',
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
  enviarOnClick(item){
    route('/estudante/enviar-redacao/'+item.id, true)
  }

  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth})
  }
 
  render() {
     let state = this.state;
    return (
        <div class="container"> 
          <h1 class="is-size-3">Temas </h1>
          <br />
          <LesTable auth={this.state.auth}  columns={this.state.columns} url={this.state.url} order_id="desc">
            <LesTableColumn type="column" column="id" label="Id" />
            <LesTableColumn type="column" column="tema" label="Tema" />

            <LesTableColumn type="column" column="redacoes" label="Redações" />
            <LesTableColumn type="column" column="criado_em" label="Criado" apply={this.formatData} search_type={"date"} />
              <LesTableButton type="button" label="Visualizar" icon="fas fa-eye" classe="button is-light is-small" title="Visualizar Revisão" onClick={this.visualizarOnClick.bind(this)} />
              <LesTableButton type="button" label="Enviar Redação" icon="fas fa-file" classe="button is-warning is-small" title="Enviar Redação no Tema" onClick={this.enviarOnClick.bind(this)} />

          </LesTable>
        </div>
    );
  }
}