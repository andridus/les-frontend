import { h, Component } from 'preact';
import * as reqwest from 'reqwest'
import * as moment from 'moment';
import { Loading, Notification, MessageBox, Message, i18n} from 'element-react';
import locale from 'element-react/src/locale/lang/pt-br'
import { route } from 'preact-router';
import {Main} from '../../../plugins/elm'
import * as Quill from  '../../../plugins/quill.min.js'
import root from 'window-or-global';
import 'element-theme-default';
export default class AdminVisualizarRevisao extends Component {
    constructor(props){
        super(props);
        console.log(props)
        this.setState({rev_slc: null, revisoes: [], loading_label: "Aguarde. Carregando Módulo de Revisão...", loading: true})
        this.load_revisao.bind(this);
        i18n.use(locale);
        document.addEventListener("contextmenu", function(e){
            e.preventDefault();
        }, false);

    }
    loadeded_revisao(flags,auth, that){
      var marks = flags.revisao_marks;
      var editors = []
        let elm_rev = document.getElementById('elm-revisor')
        elm_rev.style.display = "inline";
        var app = Main.embed(elm_rev,flags);
        root.elm_app = app;
        var _eventHandlers = {}; // somewhere global
        let subscribes = {
          sendMarks: function(marks_){
            console.log(marks, marks_)
            marks = marks_;
            updateContentCommentEditor(editors);

          },
          saveData: function(data){

          },
          finalizaData: function(data){

          },
          iniciaRevisao: function(data){


          },
          semCondicoes: function(data){


          },
          casoDeZero:function(data){

          },
          fechaRevisao:function(data){
            MessageBox.confirm(<div>
              <p> Deseja sair dessa redação?</p>
              </div>, 'Fechar Redação?', {
              confirmButtonText: 'Sim',
              cancelButtonText: 'Não',
              type: 'warning'
            }).then(() => {
              route("/admin/revisoes-pendentes");
            }).catch(() => {

            });


          },
          getTela: function(s){

            var body = document.querySelector("body");
            var html = document.querySelector("html");
            var Tela = {
                  scrollTop: parseInt(root.pageYOffset || 0),
                  pageHeight: parseInt(Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)),
                  viewportHeight: parseInt(html.clientHeight),
                  viewportWidth: parseInt(html.clientWidth),
              };
            app.ports.scrollOrResize.send(Tela);
          },
          toQuill: function({id: id, texto: texto}){
              var el = document.getElementById(id);
              el.innerHTML = texto || "";
              var toolbarOptions = [
                'bold', 'italic', 'underline',
                 'strike', { 'list': 'ordered'},
                 // { 'list': 'bullet' },
                { 'color': [] },
                { 'background': [] }, 'clean'                                        // remove formatting button
              ];
              var editor = new Quill(el,{
                modules: {
                  toolbar: toolbarOptions
                },
                placeholder: 'Faça seu comentário aqui...',
                theme: 'snow'
              });


              editor.on("text-change", function(a,b,s){
                if(s=="user"){
                  updateContentCommentEditor(editors)
                  if(editor.container.firstChild){
                    app.ports.from_quill.send({id: id, text: editor.container.firstChild.innerHTML});
                  }

                }

              })
              editors.push(editor)



          }
        };
        root.elm_app.subs_funs = subscribes;
        var addListener = function (node, event, handler, capture) {
            if(!(node in _eventHandlers)) {
                // _eventHandlers stores references to nodes
                _eventHandlers[node] = {};
            }
            if(!(event in _eventHandlers[node])) {
                // each entry contains another entry for each event type
                _eventHandlers[node][event] = [];
            }
            // capture reference
            _eventHandlers[node][event].push([handler, capture]);
            node.addEventListener(event, handler, capture);
         }

        var removeAllListeners =function (node, event) {
            if(node in _eventHandlers) {
                var handlers = _eventHandlers[node];
                if(event in handlers) {
                    var eventHandlers = handlers[event];
                    for(var i = eventHandlers.length; i--;) {
                        var handler = eventHandlers[i];
                        node.removeEventListener(event, handler[0], handler[1]);
                    }
                }
            }
        }


        var Link = Quill.import('formats/link');
        function over_marker(e){
          var item = marks.filter(function(x){
            return e == x.uid
          });
          if(item.length == 1 ){
            item[0].highlight = true;
          }
        }
        function out_marker(e){
          var item = marks.filter(function(x){
            return e == x.uid
          });
          if(item.length == 1 ){
            item[0].highlight = false;
          }
        }
          class Mark extends Link {
            static create(value) {
              let node = super.create(value);
              if(value!="not-found"){
                node.setAttribute('class', "tag is-primary is-small mark-in-editor");
                node.setAttribute('uid', value);

              }else{
                node.setAttribute('class', "tag is-danger is-small mark-in-editor");
                node.setAttribute('uid', value);
                node.setAttribute('title', "Não existe comentário associado a esse número");
              }
              return node;
            }

            format(name, value) {
              var node = this.domNode;
              if(value!="not-found"){
                if(node.getAttribute("uid") == "not-found"){
                  node.setAttribute('class', "tag is-primary is-small mark-in-editor");
                  node.setAttribute('uid', value);

                }
              }else{
                node.setAttribute('class', "tag is-danger is-small mark-in-editor");
                node.setAttribute('title', "Não existe comentário associado a esse número");
              }
              super.format(name, value);
            }
          }
           Mark.blotName = 'mark'; //now you can use .ql-hr classname in your toolbar
           Mark.tagName = 'div';


          Quill.register({
          'formats/mark': Mark
          });


        //registerServiceWorker();
          setTimeout((x)=>{
            let y = 0;
            if(root.pageYOffset<50){
              y = 50-root.pageYOffset;
            }
            let res = document.querySelector(".resumo");
            if(res){
              res.style.top = y+"px"
              res.style.display ="inline";
            }

          },50);
        root.onscroll = function(ev){
          let y = 0;
          if(root.pageYOffset<50){
            y = 50-root.pageYOffset;
          }
          let res = document.querySelector(".resumo");
          if(res) res.style.top = y+"px"
        }
        root.onresize = function(){
          var body = document.querySelector("body");
          var html = document.querySelector("html");
          var Tela = {
                scrollTop: parseInt(root.pageYOffset || 0),
                pageHeight: parseInt(Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)),
                viewportHeight: parseInt(html.clientHeight),
                viewportWidth: parseInt(html.clientWidth),
            };
            app.ports.scrollOrResize.send(Tela);
        }

        var updateContentCommentEditor = function(editors){
          editors.forEach(function(x){
            var contents = x.getText();
            var regex = /#\d+/g;
            var str = contents;
            var m;
            var m1 = [];

            while ((m = regex.exec(str)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                m1.push({editor: x, match: m});
            }
            m1.forEach(function(x){

              var idx = x.match[0].substr(1,x.match[0].length);
              var m1 = marks.filter(function(x,i){
                return idx == (i+1)
              })
              if(m1.length>0){
                x.editor.formatText(x.match.index,x.match[0].length, 'mark', m1[0].uid);
                x.editor.formatText(x.match.index+x.match[0].length,1, 'mark', false);
              }else{
                x.editor.formatText(x.match.index,x.match[0].length, 'mark', "not-found");
                x.editor.formatText(x.match.index+x.match[0].length,1, 'mark', false);
              }
            })

          })

          var mrks = document.querySelectorAll(".mark-in-editor");
          mrks.forEach(function(el){
            el.onmouseover = function(){
              var v = {uid: el.attributes.uid.value, over: true}
              app.ports.over_mark.send(v)
            }
            el.onmouseout = function(){
              var v = {uid: el.attributes.uid.value, over: false}
              app.ports.over_mark.send(v)
            }
          })

        }
        app.ports.send_marks.subscribe(subscribes.sendMarks);
        app.ports.saveData.subscribe(subscribes.saveData);
        app.ports.finalizaData.subscribe(subscribes.finalizaData);
        app.ports.iniciaRevisao.subscribe(subscribes.iniciaRevisao);
        app.ports.semCondicoes.subscribe(subscribes.semCondicoes);
        app.ports.casoDeZero.subscribe(subscribes.casoDeZero);
        app.ports.fechaRevisao.subscribe(subscribes.fechaRevisao);
        app.ports.getTela.subscribe(subscribes.getTela);
        app.ports.to_quill.subscribe(subscribes.toQuill);


      }
      componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
        if(!this.state.auth && props.auth){
          console.log("PISCADINHA")
          this.setState({auth: props.auth})
          this.load_revisao();
        }
      }
    load_revisao(){
      let that = this;
      if(this.state.auth){
        reqwest({
          url: root.url_base+'/api/admin/revisao/'+this.props.id+"/visualizar"
          , method: 'post'
          , headers: {
            'Authorization':'Bearer '+this.state.auth.jwt
          }
          , data: {}
          , success: function (resp) {
            let slc = null;
            if(resp.items.length) slc = resp.items[0].revisao_id;

            that.setState({loading: false,  rev_slc: slc, loading_label: "Aguarde. Carregando Módulo de Revisão...", revisoes: resp.items})
            console.log(resp)
            that.loadeded_revisao(resp.items[0], that.state.auth, that);
            root.redacao_visualizada = resp.id_visualizacao;
          }
          , error: function(error){
              that.setState({loading: false,loading_label: "Aguarde. Carregando Módulo de Revisão..."})

              that.error_messages(error, function(){
                MessageBox.confirm(<div>
                      <p>
                        Você será redirecionado para as Redações Pendentes.
                      </p>
                </div>, 'Erro com a imagem da redação!', {
                confirmButtonText: 'Certo.',
                showCancelButton: false,
                type: 'error'
                }).then(() => {
                  route("/admin/revisoes-pendentes", false);
                }).catch(()=>{route("/admin/revisoes-pendentes", false); })

              })
          }
        });
      }
    }
    error_messages(error, fn){
      if(error.response == ""){
        MessageBox.confirm(<div>
              <p>
                Desculpe, mas a redação que você está tentando acessar não está acessível.
              </p>
              <p>
                É possível que tenha acontecido algum erro na sua página ou no servidor.
              </p>
              <p>
                Por favor tente entrar no link novamente, se o erro persistir informe a administração do <u>Letras Solidárias</u> sobre o ocorrido.
              </p>
              <p>
              No mais, perdoe-nos pelo inconveniente e agradecemos pela sua paciência!
              </p>
        </div>, 'Erro de Acesso!', {
        confirmButtonText: 'Certo.',
        showCancelButton: false,
        type: 'error'
        }).then(() => {
          route("/revisor/banco-de-redacoes", false);
        }).catch(()=>{})
      }else{
        let err = JSON.parse(error.response)
        switch(err.error){
          case 1:
            MessageBox.confirm(<div>
                  <p>
                    Você não pode revisar essa redação, ela não está disponível.
                  </p>
            </div>, 'Você não pode revisar', {
            confirmButtonText: 'Certo.',
            showCancelButton: false,
            type: 'info'
            }).then(() => {
              fn();
            }).catch(()=>{})
            break;
          case 2:
            MessageBox.confirm(<div>
                  <p>
                    Essa redação já recebeu o limite de revisões permitidos.
                  </p>
            </div>, 'Limite de revisões atingido! !', {
            confirmButtonText: 'Certo.',
            showCancelButton: false,
            type: 'info'
            }).then(() => {
              fn();
            }).catch(()=>{})
            break;
          case 4:
            MessageBox.confirm(<div>
                  <p>
                    A imagem da redação não está disponível!.
                  </p>
            </div>, 'Erro com a imagem da redação!', {
            confirmButtonText: 'Certo.',
            showCancelButton: false,
            type: 'error'
            }).then(() => {
              fn();
            }).catch(()=>{})
            break;
            case 3:
              MessageBox.confirm(<div>
                    <p>
                      Você já revisou essa redação e não pode revisar novamente.
                    </p>
              </div>, 'Você já revisou essa redação!', {
              confirmButtonText: 'Certo.',
              showCancelButton: false,
              type: 'info'
              }).then(() => {
                fn();
              }).catch(()=>{})
              break;
          default:

        }
      }

    }
    componentDidMount(el){
      let elm_rev = document.getElementById("elm-revisor");
      elm_rev.style.display = "block";
    }
    componentWillUnmount(){
      console.log("UNMOUNT")

      if(root.elm_app){
        let elm_rev = document.getElementById("elm-revisor");
        elm_rev.style.display = "none";
        elm_rev.innerHTML = "";
        let elm = root.elm_app;
        elm.ports.casoDeZero.unsubscribe(elm.subs_funs.casoDeZero);
        elm.ports.fechaRevisao.unsubscribe(elm.subs_funs.fechaRevisao);
        elm.ports.fechaTempoEsgotado.unsubscribe(elm.subs_funs.fechaTempoEsgotado);
        elm.ports.finalizaData.unsubscribe(elm.subs_funs.finalizaData);
        elm.ports.getTela.unsubscribe(elm.subs_funs.getTela);
        elm.ports.iniciaRevisao.unsubscribe(elm.subs_funs.iniciaRevisao);
        elm.ports.saveData.unsubscribe(elm.subs_funs.saveData);
        elm.ports.semCondicoes.unsubscribe(elm.subs_funs.semCondicoes);
        elm.ports.send_marks.unsubscribe(elm.subs_funs.sendMarks);
        elm.ports.to_quill.unsubscribe(elm.subs_funs.toQuill);
      }
      if(root.redacao_visualizada){
        reqwest({
          url: root.url_base +'/api/revisor/fechar-visualizacao/'+root.redacao_visualizada
        , type: 'json'
        , method: 'post'
        , headers: {
              'Authorization':'Bearer '+this.state.auth.jwt
            }
        , data: { }
        })
        .then(function (resp) {
        })
        .fail(function (err, msg) {
        });
      }else{
      }
      //
      //root.location.assign(e.url)
    }
    render(){
        return (<div>
          {this.state.loading && <Loading fullscreen={true} text={this.state.loading_label} />}
          <div class="buttons">
            {this.state.revisoes.map( r => {
              return <div class="button is-light">
                {r.revisao_revisor_nome} ({moment(r.revisao_atualizado).format("D/M/Y H:m:s")})
              </div>
            })}
          </div>

        </div>)
    }
}
