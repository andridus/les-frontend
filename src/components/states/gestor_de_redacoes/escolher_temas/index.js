import { h, Component } from 'preact';
import * as reqwest from 'reqwest';
import { Link } from 'preact-router/match';
import style from './style';
import root from 'window-or-global';
export default class GestorEscolherTemas extends Component{
  constructor(props){
    super();
    this.setState({url: root.url_base+'/api/gestor/temas', items: [], loading: false});
    this.onTemaSelected = this.onTemaSelected.bind(this);
    this.selectingTema = this.selectingTema.bind(this);

  }
  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    let auth_before = this.state.auth;
    this.setState({auth: props.auth, columns: props.columns});
    if(props.auth != undefined && !auth_before)
      this.handleGetItems();
  }

  handleGetItems(){
    let that = this;
    that.setState({loading: true});
    reqwest({
        url: this.state.url
      , type: 'json'
      , method: 'post'
      , headers: {
        'Authorization':'Bearer '+this.state.auth.jwt
      }
      , data: {$limit: 50, $offset: 0, order$id: "desc"}
      , crossOrigin: true
      })
    .then(function (resp) {
        that.setState({loading: false, items: resp.items, count: resp.items.length});
          if(that.props.tema!=undefined && that.props.tema!= null){
            let tema = that.selectingTema(that.props.tema);
            that.props.onTemaSelected(tema[0]);

          }
      })
    .fail(function (err, msg) {
        that.setState({loading: false});
    });

  }
  onTemaSelected(ev){
    let tid = ev.target.attributes["tema"].value;
    tid = parseInt(tid)
    let tema = this.selectingTema(tid);
    this.props.onTemaSelected(tema[0]);
  }
  selectingTema(id){
    let tid = id;
    tid = parseInt(tid)
    let temas = this.state.items.map( x => { 
        if(x.id == tid)
        {
          x.selected = true;
          return x;
        } 
        else
        {
          x.selected = false;
          return x;
        } 
              
    } );
    this.setState({items: temas});
    let tema = this.state.items.filter( x => { return x.id == tid } );
    return tema
  }
  componentDidUpdate(e){
    setTimeout(function(){
      let seltema = document.querySelector("."+style.selecao_tema);
      let card = document.querySelector(".selected");
      if(card )
        seltema.scrollLeft = card.offsetLeft-20;
    }, 500);
  }
  render(){
    let w = "width:"+(this.state.items.length*211)+"px";
    
    return (
      <div>
        
        <div class={style.selecao_tema}>
          <div style={w}>
            {this.state.items.map( tema => {
              let selected = tema.selected ? "is-success" : "is-warning";
              let selected1 = tema.selected ? " selected" : "";
              return (<div class={"card " + style.tema_1 + selected1 }>
                        <div class="card-content">
                          <div class="content">
                            <div class="buttons has-addons">
                              <a href={"http://novo.letrassolidarias.com.br/"+tema.url} class="button" target="_blank" title="Ver tema">
                                <i class="fa fa-eye np"></i>
                              </a>
                              <span class={"button "+selected} title="Tema Selecionado" onClick={this.onTemaSelected} tema={tema.id}>
                                <i class="fa fa-check np"></i>
                              </span>
                            </div>
                          </div>
                          <p>{tema.tema}</p>
                        </div>
                      </div>)
              })
            }
          </div>
        </div>
        <Link href="/gestor/temas" class={style.link_mais_temas}>ver temas</Link>
        <div class="is-clearfix" ></div>
      </div>
      )
  }
}