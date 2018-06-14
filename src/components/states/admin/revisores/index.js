import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import {LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import { Link } from 'preact-router/match';

import { DatePicker, Popover, i18n} from 'element-react';
import locale from 'element-react/src/locale/lang/pt-br'
import 'element-theme-default';
import root from 'window-or-global';

export default class AdminRevisores extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth, 
      url: root.url_base+'/api/admin/revisores/2018',
      ano: "2018"
    })
    i18n.use(locale);
  }
  formatAutor(x, item){
    return (<Link href={"/admin/estudante/"+item.autor_id}>
              <span> {x} </span>
            </Link>)

  }
  formatRevisor(x, item){
    return (<Link href={"/admin/revisor/"+item.revisor_id}>
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
    console.log("visualizar", item)
  }
  aceitarOnClick(item){
    console.log("aceitar", item)
  }
  recusarOnClick(item){
    console.log("recusar", item)
  }
  aceitarTodosOnClick(item){
    console.log("aceitar", item)
  }
  recusarTodosOnClick(item){
    console.log("recusar", item)
  }

  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth})
  }
  splitDate(date){
    if(date!= undefined && date!= null){
      let dt = date.split("<=>");
      let res = ["",""];
        if(dt != null){
          res = [moment(dt[0],"YYYY-MM-DD HH:mm:ss").toDate(), moment(dt[1],"YYYY-MM-DD HH:mm:ss").toDate() ];
        }
      return res[0];
    }else{
      return null;  
    }
    
  }

  setYear(ev){
    let ano = ev.target.attributes.ano.value
    this.setState({ ano: ano,
                   url: root.url_base+'/api/admin/revisores/'+ano,
                   semana: null
                   })
  }
  formatPopoverRevisor(x,item){
  let nt = ( <div>
        <b> Entrou: {this.formatData(item.entrou)} </ b>  <br />
      </div>) 
  return (<Popover placement="top-start" width="200" trigger="hover" content={nt}>
      <span>{this.formatRevisor(x, item)}</span>
    </Popover>)
   }
   formatBloqueado(x){
    switch(x) {
      case 1:
        return (<span class="button is-danger is-small">Sim</span>);
      case 0:
        return (<span class="button is-success is-small">Não</span>);
      default:
        return x;
    }

  }
  render() {
     let state = this.state;
    return (
        <div class="container"> 
          <h1 class="is-size-3">Revisores </h1>
          <br />
          <div class="column">
            <h1 class="has-text-weight-bold is-size-5">Período</h1>
            <div class="field has-addons">
              <p class="control">
                <div class={state.ano == "2014" ? "button is-dark is-disabled" : "button is-light is-disabled"} ano="2014" onClick = {this.setYear.bind(this)}>
                  <span class="np">2014</span>
                </div>
                <div class={state.ano == "2015" ? "button is-dark is-disabled" : "button is-light is-disabled"} ano="2015" onClick = {this.setYear.bind(this)}>
                  <span class="np">2015</span>
                </div>
                <div class={state.ano == "2016" ? "button is-dark is-disabled" : "button is-light is-disabled"} ano="2016" onClick = {this.setYear.bind(this)}>
                  <span class="np">2016</span>
                </div>
                <div class={state.ano == "2017" ? "button is-dark is-disabled" : "button is-light is-disabled"} ano="2017" onClick = {this.setYear.bind(this)}>
                  <span class="np">2017</span>
                </div>
                <div class={state.ano == "2018" ? "button is-dark is-disabled" : "button is-light is-disabled"} ano="2018" onClick = {this.setYear.bind(this)}>
                  <span class="np">2018</span>
                </div>
                <div class="button is-light"  ><DatePicker 
                    value={this.splitDate(state.semana)} 
                    selectionMode="week"
                    placeholder="Selecione a data" 
                    onChange={ date => {
                      let semana = null;
                      if(date !=null)
                      {
                        semana = moment(date).format("YYYY-MM-DD HH:mm:ss") ;
                        
                      }

                        this.setState({ano: null, semana: semana, url: root.url_base+'/api/admin/revisores/'+semana});
                      
                    }}
                   align="right" 
                    />
                    <div class={state.ano == null ? "button is-dark is-disabled np" : "button is-light is-disabled np"}>
                  <span class="np">Semana</span>
                </div>
                    </div>
              </p>
            </div>
          </div>
          
          <LesTable auth={this.state.auth}  columns={this.state.columns} url={this.state.url}>
            <LesTableColumn type="column" column="id" label="Id" />
            <LesTableColumn type="column" column="revisor" label="Revisor" apply={this.formatPopoverRevisor.bind(this)} />

            <LesTableColumn type="column" column="revisoes_geral" label="Revisoes Geral" />
            <LesTableColumn type="column" column="revisoes_geral_ano" label="Revisoes do Ano" />
            <LesTableColumn type="column" column="revisoes_aprovadas" label="Revisoes Aprovadas" />

            <LesTableColumn type="column" column="revisoes_pendentes" label="Revisoes Pendentes" />
            <LesTableColumn type="column" column="revisoes_recusadas" label="Revisões Recusadas" />
            <LesTableColumn type="column" column="semana_atual" label="Nesta Semana" />
            <LesTableColumn type="column" column="semana_passada" label="Semana Passada" />
            <LesTableColumn type="column" column="bloqueado" label="Bloqueado" apply={this.formatBloqueado}>
              <LesTableQueryOpt type="filter" label="Sim" value="1" />
              <LesTableQueryOpt type="filter" label="Não" value="0" />
            </LesTableColumn>


          </LesTable>
        </div>
    );
  }
}