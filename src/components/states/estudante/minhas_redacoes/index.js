import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import * as moment from 'moment';
import {Button, LesTable, LesTableColumn, LesTableQueryOpt, LesTableButton} from '../../../les_table';
import { Link } from 'preact-router/match';
import { route } from 'preact-router';
import { MessageBox, Message, Popover } from 'element-react';
import 'element-theme-default';
import root from 'window-or-global';
export default class EstudanteMinhasRedacoes extends Component {
  constructor(props){
    super(props);
    this.setState({
      auth: props.auth, 
      url: root.url_base+'/api/estudante/minhas-redacoes'
      

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

  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth})
  }
  handleVisualizaRedacao(item){
    route('/estudante/redacao/'+item.id+'/visualizar');
  }
  handleRemoveRedacao(item){
    let that = this;
    if(item.status == "Pendente"){
      MessageBox.msgbox({
      title: 'Remover Redacão #'+item.id+'?',
      message: (<div> Você tem certeza de que deseja remover a redação <b>#{item.id}</b> com o tema <b>{item.tema}</b>?</div>),
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(action => {
      if(action == "confirm")
      {
        reqwest({
          url: root.url_base + '/api//estudante/remover-redacao/'+item.id
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
                  A redação #{item.id} foi REMOVIDA! 
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
    }else{
      Message({
        type: 'warning',
        message:(<i> É possível remover apenas as redações pendentes</i>)
      });
    }
    
  }
  render() {
    return (
        <div class="container"> 
            <h1 class="is-size-3">Redações </h1>
            <br />
            <LesTable auth={this.state.auth}  columns={this.state.columns} url={this.state.url} order_id="desc">
              <LesTableColumn type="column"column="id" label="Id" />
              
              <LesTableColumn type="column"column="tema" label="Tema" />
              <LesTableColumn type="column"column="status" label="Status" apply={this.formatStatus}>
                <LesTableQueryOpt type="filter" label="Aprovado" value="Aprovado" />
              </LesTableColumn>
              <LesTableColumn type="column"column="revisoes" label="Revisões"/>

              <LesTableColumn type="column"column="media" label="Nota" apply={this.formatMedia} apply={this.formatPopoverMedia.bind(this)}/>
              <LesTableColumn type="column"column="data" label="Enviado" apply={this.formatData} search_type={"date"}/>
              
              <LesTableButton type="button" label="Visualizar" icon="fas fa-eye" classe="button is-light is-small" title="Visualizar Redação"  onClick={this.handleVisualizaRedacao.bind(this)}/>
              <LesTableButton type="button" label="Remover" icon="fas fa-trash" classe="button is-danger is-small" title="Remover Redação"  onClick={this.handleRemoveRedacao.bind(this)} />
            </LesTable>
        </div>
    );
  }
}
