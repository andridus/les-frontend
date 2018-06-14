import { h, Component } from 'preact';
import {Main} from '../../../plugins/elm'
import * as reqwest from 'reqwest'
import * as Quill from  '../../../plugins/quill.min.js'
import * as moment from 'moment';
import { Loading, Notification, MessageBox, Message, i18n} from 'element-react';
import locale from 'element-react/src/locale/lang/pt-br'
import { route } from 'preact-router';
import root from 'window-or-global';
import 'element-theme-default';
export default class RevisorRevisar extends Component {
    constructor(props){
        super(props);
        this.setState({loading_label: "Aguarde. Carregando Módulo de Revisão...", loading: true})
        this.load_revisao.bind(this);
        i18n.use(locale);
        document.addEventListener("contextmenu", function(e){
            e.preventDefault();
        }, false);

    }


    loadeded_revisao(flags,auth, that){
      var marks = flags.revisao_marks;
      root.editors = [];
      if(flags.redacao_tema_url && flags.redacao_tema_url[0]=="u"){
        
        flags.redacao_tema_url = root.url_base +'/'+ flags.redacao_tema_url;
      }
      console.log(flags);
      var editors = root.editors;
        let elm_rev = document.getElementById('elm-revisor')
        elm_rev.style.display = "inline";
        var app = Main.embed(elm_rev,flags);
        root.elm_app = app;


        var _eventHandlers = {}; // somewhere global

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

         let subscribes = {
           sendMarks: function(marks_){
             marks = marks_;
             updateContentCommentEditor(editors);

           },
           saveData: function(data){
             Message({
                 type: 'warning',
                 message: <small>Estamos salvando seu progresso.</small>
               });
             let dados = {
               redacao_id: data.redacao_id,
               revisao_marks: data.marks,
               revisao_id: data.revisao_id,
               revisao_nota: data.nota,
               revisao_comp1: parseInt(data.comp1.pontos),
               revisao_comp2: parseInt(data.comp2.pontos),
               revisao_comp3: parseInt(data.comp3.pontos),
               revisao_comp4: parseInt(data.comp4.pontos),
               revisao_comp5: parseInt(data.comp5.pontos),
               revisao_obs: data.obscomp.text,
               revisao_obscomp1: data.comp1.text,
               revisao_obscomp2: data.comp2.text,
               revisao_obscomp3: data.comp3.text,
               revisao_obscomp4: data.comp4.text,
               revisao_obscomp5: data.comp5.text,
               revisao_rotate: data.rotate,
               revisao_zoom: data.zoom,
             }
             reqwest({
               url: root.url_base+'/api/revisor/salva-revisao/'
               , method: 'post'
               , headers: {
                 'Authorization':'Bearer '+auth.jwt
               }
               , data: dados
               , success: function (resp) {
                   Message({
                       type: 'success',
                       message: <small>Salvo às <i>{moment().format("H:mm:ss")}</i>.</small>
                     });
               }
               , error: function(error){
                   that.error_messages(error, function(){})
               }
             })



           },
           finalizaData: function(data){
             Message({
                 type: 'warning',
                 message: <small>Estamos salvando seu progresso.</small>
               });
             let dados = {
               redacao_id: data.redacao_id,
               revisao_marks: data.marks,
               revisao_id: data.revisao_id,
               revisao_nota: data.nota,
               revisao_comp1: parseInt(data.comp1.pontos),
               revisao_comp2: parseInt(data.comp2.pontos),
               revisao_comp3: parseInt(data.comp3.pontos),
               revisao_comp4: parseInt(data.comp4.pontos),
               revisao_comp5: parseInt(data.comp5.pontos),
               revisao_obs: data.obscomp.text,
               revisao_obscomp1: data.comp1.text,
               revisao_obscomp2: data.comp2.text,
               revisao_obscomp3: data.comp3.text,
               revisao_obscomp4: data.comp4.text,
               revisao_obscomp5: data.comp5.text,
               revisao_rotate: data.rotate,
               revisao_zoom: data.zoom,
             }
             reqwest({
               url: root.url_base+'/api/revisor/salva-revisao/'
               , method: 'post'
               , headers: {
                 'Authorization':'Bearer '+auth.jwt
               }
               , data: dados
               , success: function (resp) {
                   Message({
                       type: 'success',
                       message: <small>Salvo às <i>{moment().format("H:mm:ss")}</i>.</small>
                     });
               }
               , error: function(error){
                   that.error_messages(error, function(){})
               }
             })
             MessageBox.confirm(<div>
               <p> Você clicou em <u>Finalizar Revisão</u>.</p>
               <p> É importante saber que uma vez finalizada a revisão não é possível voltar para editá-la, pois tomamos como verdade que vocẽ concluiu, efetivamente, a revisão.</p><p><b> Você tem certeza de que deseja FINALIZAR essa revisão?</b></p>
               </div>, 'Finalizar Revisão?', {
               confirmButtonText: 'Sim, tenho certeza',
               cancelButtonText: 'Cancelar',
               type: 'warning'
             }).then(() => {
               Message({
                   type: 'warning',
                   message: <small>Estamos finalizando sua revisão, pode levar alguns segundos.</small>
                 });
               reqwest({
                 url: root.url_base+'/api/revisor/finaliza-revisao/'
                 , method: 'post'
                 , headers: {
                   'Authorization':'Bearer '+auth.jwt
                 }
                 , data: dados
                 , success: function (resp) {
                     MessageBox.confirm(<div>
                       <p>
                         Sua Revisão foi finalizada com sucesso!
                         </p>
                       <p>
                       Agradecemos sua dedicação e seu esforço!
                       </p><br /><br /><p>
                       Você será redirecionado para a sua página inicial.</p>
                       </div>, 'Revisão finalizada!', {
                       confirmButtonText: 'Certo.',
                       showCancelButton: false,
                       type: 'success'
                     }).then(() => {
                       route("/", true);
                     }).catch(() => {

                     });
                 }
                 , error: function(error){
                     that.error_messages(error, function(){})
                 }
               })

             }).catch(() => {

             });
           },
           iniciaRevisao: function(data){
             console.log("INICIA REVISAO!!!!!!", data)

             MessageBox.confirm(
               (<div><p>Você está iniciando a revisão dessa redação, saiba que você tem um prazo de
                 <u> 48h para revisar essa redação</u>. Após esse prazo a redação retornará automaticamente ao Banco de Redações
                   e você perderá o seu progresso.</p><br /><p> A Revisão irá iniciar a partir do sua <b>Confirmação</b>.</p>
               </div>), 'Iniciando Revisão',{
               confirmButtonText: 'Sim',
               cancelButtonText: 'Não',
               type: 'warning'
             }).then((action) => {
                 that.setState({loading: true, loading_label: "Aguarde. Iniciando nova revisão..."})
                 reqwest({
                   url: root.url_base+'/api/revisor/nova-revisao/'
                   , method: 'post'
                   , headers: {
                     'Authorization':'Bearer '+auth.jwt
                   }
                   , data: {id: flags.redacao_id, rotate: data.rotate}
                   , success: function (resp) {
                     app.ports.observeData.send(resp.item);
                     that.setState({loading: false})
                   }
                   , error: function(error){
                       that.error_messages(error, function(){})
                   }
                 })
               }).catch(()=>{
                 Message({
                   type: 'info',
                   message: 'Cancelado'
                 });
               })

           },
           semCondicoes: function(data){
             MessageBox.confirm(<div>
               <p> Esta redação está sem condições para revisão?</p>
               </div>, 'Sem condições de Revisão?', {
               confirmButtonText: 'Sim',
               cancelButtonText: 'Não',
               type: 'warning'
             }).then(() => {
               MessageBox.prompt('É importante que você escreva uma observação antes', 'Escreva uma observação', {
                 confirmButtonText: 'OK',
                 cancelButtonText: 'Cancelar',
               }).then(({ value }) => {
                 reqwest({
                   url: root.url_base+'/api/revisor/sem-condicoes/'
                   , method: 'post'
                   , headers: {
                     'Authorization':'Bearer '+auth.jwt
                   }
                   , data: {id: flags.redacao_id, obs: value, rotate: data.rotate}
                   , success: function (resp) {

                     root.redacao_visualizada = resp.id_visualizacao;
                     Message({
                         type: 'success',
                         message: <small>Redação SEM CONDIÇÕES salva com sucesso. Redirecionando para o Banco de Redações.</small>
                       });
                     setTimeout(function(){
                       root.location.href="/revisor/banco-de-redacoes";
                     },2000);
                   }
                   , error: function(error){
                       that.error_messages(error, function(){})
                   }
                 })
               }).catch(() => {

               });;
             }).catch(() => {

             });

           },
           casoDeZero:function(data){
             console.log("CASO DE ZERO!!!!!!", data)
             let label = "N/A";
             switch(data.casozero){
               case 1:
                 label = "Texto Insuficiente"
                 break;
               case 2:
                 label = "Fuga ao tema"
                 break;
               case 3:
                 label = "Não atendimento da tipologia"
                 break;
               case 4:
                 label = "Parte desconectada"
                 break;
               case 5:
                 label = "Assinatura"
                 break;
               case 6:
                 label = "Feriu os direitos humanos"
                 break;
               case 7:
                 label = "Plágio"
                 break;
               default:
                 break;
             }
             MessageBox.confirm(<div>
               <p> É uma redação com caso de zero?</p>
               <p> Com o rótulo: <b>{label}</b></p>
               </div>, 'Caso de Zero?', {
               confirmButtonText: 'Sim',
               cancelButtonText: 'Não',
               type: 'warning'
             }).then(() => {
               MessageBox.prompt('É importante que você escreva uma observação antes', 'Escreva uma observação', {
                 confirmButtonText: 'OK',
                 cancelButtonText: 'Cancelar',
               }).then(({ value }) => {
                 reqwest({
                   url: root.url_base+'/api/revisor/caso-de-zero/'
                   , method: 'post'
                   , headers: {
                     'Authorization':'Bearer '+auth.jwt
                   }
                   , data: {id: data.redacao_id, obs: value, rotate: data.rotate, casozero: data.casozero}
                   , success: function (resp) {

                     root.redacao_visualizada = resp.id_visualizacao;
                     Message({
                         type: 'success',
                         message: <small>Redação CASO DE ZERO salva com sucesso. Redirecionando para o Banco de Redações.</small>
                       });
                     setTimeout(function(){
                       root.location.href="/revisor/banco-de-redacoes";
                     },2000);
                   }
                   , error: function(error){
                       that.error_messages(error, function(){})
                   }
                 }).catch(()=>{
                   Message({
                     type: 'info',
                     message: 'Cancelado'
                   });
                 })
               }).catch(()=>{
                 Message({
                   type: 'info',
                   message: 'Cancelado'
                 });

               })
             }).catch(()=>{
               Message({
                 type: 'info',
                 message: 'Cancelado'
               });
             });
           },
           fechaRevisao: function(data){
             MessageBox.confirm(<div>
               <p> Deseja sair dessa redação?</p>
               </div>, 'Fechar Redação?', {
               confirmButtonText: 'Sim',
               cancelButtonText: 'Não',
               type: 'warning'
             }).then(() => {
               console.log(root.history)
               if(root.history.length == 1){
                 route('/revisor/banco-de-redacoes');
               }else{
                 root.history.back();
               }
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
           },
           descartarRevisao: function(data){
             //route("/revisor/revisar/"+item.redacao_id)
             MessageBox.confirm(<div>
               <p> Saiba que ao devolver essa redação você perderá todo o seu progresso. Tem certeza de que deseja devolver essa redação para o banco?</p>
             </div>, 'Devolver redação?', {
                 confirmButtonText: 'Sim',
                 cancelButtonText: 'Não',
                 type: 'warning'
               }).then(() => {
                 console.log("here", that);
                 reqwest({
                   url: root.url_base + '/api/revisor/devolver-redacao/'
                   , method: 'post'
                   , headers: {
                     'Authorization': 'Bearer ' + that.state.auth.jwt
                   }
                   , data: { id: data.revisao_id }
                   , success: function (resp) {

                     Message({
                       type: 'success',
                       message: <small>Redação #{data.redacao_id} devolvida para o Banco de Redações.</small>
                     });
                     route("/revisor/minhas-revisoes/")
                   }
                   , error: function (error) {
                     Message({
                       type: 'success',
                       message: <small>Não foi possível devolver essa redação.</small>
                     });
                   }
                 })
               }).catch(e => { });
           },
           fazerDownload: function(data){
             console.log('donwload', data);
             var link = document.createElement('a');
             link.setAttribute('href', data.redacao_img);
             link.setAttribute('download', `${data.redacao_id}.png`);
             link.setAttribute('target', '_blank');
             link.style.display = 'none';
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
           }
          
         };
         root.elm_app.subs_funs = subscribes;

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
            if(root.elm_app);
              root.elm_app.ports.scrollOrResize.send(Tela);
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
        app.ports.descartarRevisao.subscribe(subscribes.descartarRevisao);
        app.ports.fazerDownload.subscribe(subscribes.fazerDownload)



      }
    componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
      if(!this.state.auth && props.auth){
        this.setState({auth: props.auth})
        this.load_revisao();
      }
    }
    load_revisao(){
      let that = this;
      if(this.state.auth){
        reqwest({
          url: root.url_base+'/api/revisor/antes-de-revisar/'+this.props.id
          , method: 'post'
          , headers: {
            'Authorization':'Bearer '+this.state.auth.jwt
          }
          , data: {}
          , success: function (resp) {
            that.setState({loading: false, loading_label: "Aguarde. Carregando Módulo de Revisão..."})
            that.loadeded_revisao(resp.item, that.state.auth, that);
            root.redacao_visualizada = resp.id_visualizacao;
          }
          , error: function(error){
              that.setState({loading: false, loading_label: "Aguarde. Carregando Módulo de Revisão..."})

              that.error_messages(error, function(){
                MessageBox.confirm(<div>
                      <p>
                        Você será redirecionado para o Banco de Redações.
                      </p>
                </div>, 'Erro com a imagem da redação!', {
                confirmButtonText: 'Certo.',
                showCancelButton: false,
                type: 'error'
                }).then(() => {
                  route("/revisor/banco-de-redacoes", false);
                }).catch(()=>{route("/revisor/banco-de-redacoes", false); })

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
      console.log("UNMOUNT", );
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
        elm.ports.descartarRevisao.unsubscribe(elm.subs_funs.descartarRevisao);
        elm.ports.fazerDownload.unsubscribe(elm.subs_funs.fazerDownload);
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
    }
    render(){
        return (<div>{this.state.loading && <Loading fullscreen={true} text={this.state.loading_label} />}</div>)
    }
}
