import { h, Component } from 'preact';
import Dropzone from 'react-dropzone'
import style from './style';
import * as xhr from 'xhr';
import * as reqwest from 'reqwest';
import * as uid from 'uid';
import { MessageBox, Input, Message, Notification, Loading } from 'element-react';
import 'element-theme-default';
import Lightbox from 'lightbox-react';
import root from 'window-or-global';
export default class GestorRedSubirRedacao extends Component{
  constructor(props){
    super(props);
    this.onDrop = this.onDrop.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.setState({
        url: root.url_base+'/api/gestor/subir-redacao'
      , url_remover: root.url_base+'/api/gestor/remover-redacao/'
      , auth: props.auth
      , file: null
      , tema: props.tema
      , eid: props.eid});

    

  }
  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth, columns: props.columns, tema: props.tema, est: props.est, uploading: false})
  }
  onProgress(evt,e){
    let file = this.state.file
     file.loaded = evt.loaded;
      if(file.loaded >= file.size){
        file.completed = true;
      }
    this.setState({file: file})
  }
  onDrop(files) {
    if(files.length){
      let that = this;
      let tema = this.state.tema;
      let est = this.state.est;
      
      let file = files[0];
      file.uid = uid(10);
      file.loaded = 0;
      file.tema = tema.tema;
      file.success = false;
      file.completed = false;
      file.error = false;
      this.setState({file: file, uploading: true});

      let formData = new FormData();
      formData.append('file', file);
      formData.append('tema_id', tema.id);
      formData.append('eid', est.id);
        xhr({
          url: that.state.url
        , method: 'post'
        , headers: {
          'Authorization':'Bearer '+that.state.auth.jwt,
          }
        , body: formData
        
        , beforeSend: (xhrObject ) => {
            xhrObject.upload.uid = file.uid;
            xhrObject.upload.onprogress = that.onProgress;
         }
        }, (err, resp, body) => {
            that.props.onUpdate();
            if(resp.statusCode == 200){
              let body = JSON.parse(resp.body);
              let sv = body;
              console.log(sv)
              let file_uid = resp.rawRequest.upload.uid;
              let file = that.state.file
                  file.completed = true;
                  file.success = true;
                  file.id = sv.id;
              that.setState({file: file})
              Notification({
                message: (<small>Redação de <b>{ est.nome }</b> Enviada!</small>),
                type: 'success'
              });
            }else{
              let file_uid = resp.rawRequest.upload.uid;
              let file = that.state.file
                  file.completed = true;
                  file.error = true;
              that.setState({file: file})
              Notification({
                message: (<span>Erro no envio da redação de <b> { est.nome } </b>!</span>),
                type: 'danger'
              });
            }
        })
      }else{
        MessageBox.msgbox({
          title: 'Erro ao tentar enviar imagem!',
          message: (<p> Você não pode enviar imagens/pdf com valores maiores a 8MB, por favor, selecione uma imagem ou pdf com valor menor que o informado</p>),
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: 'Certo',
        })
      }
    
  }
  removerRedacao(){
    let that = this;
    if(this.state.file.id){
      MessageBox.msgbox({
        title: 'Remover Redação?',
        message: ' Você tem certeza de que deseja remover essa redação que você subiu? ',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
      }).then(action => {
        if(action == "confirm")
        {
          reqwest({
              url: this.state.url_remover + this.state.file.id
            , type: 'json'
            , method: 'delete'
            , headers: {
              'Authorization':'Bearer '+this.state.auth.jwt
            }
            , data: {}
            , crossOrigin: true
            })
          .then(function (resp) {
               Notification({
                  message: (<small>Redação de <b>{ that.state.est.nome }</b> Removida!</small>),
                  type: 'info'
                });
               that.setState({file: null})
               that.props.onUpdate();

                
            })
          .fail(function (err, msg) {
              MessageBox.msgbox({
                title: 'Erro ao tentar remover a redação!',
                message: (<p> Não foi possível remover esta redação, tente novamente mais tarde</p>),
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: 'Certo',
              })
          });
        }
        
      });

    }else{
      that.setState({file: null})
    }
    
    
  }
  render(){
    let file = this.state.file;
    let file_preview = null;
    let visible = file ? "none" : "inline";
    if(!this.state.tema)
    {
      return (
          <div>
              <div class="has-text-grey has-text-centered">
                Você precisa selecionar um tema antes de enviar a redação.
              </div>
          </div>
          )
    }
    else
    {
      if(file)
      {
          let ch = root.innerWidth/14;
          let progress0 = (<progress class="progress" value={file.loaded} max={file.size} style="width: 100px; float: right"></progress>)

          let completed = (<div class="tag is-warning" style="width: 100px; float: right">Processando</div>)

          let success = (<div>
            
            <div class="button is-success is-small np" style="width: 100px; float: right">Enviado</div>
            <div class="button is-light is-small" style="cursor: pointer, width: 30px; float: right" title="Excluir redação" onClick={this.removerRedacao.bind(this)}><i class="fa fa-trash"></i></div>
            </div>)

          let fail = (<div><div class="button is-light is-small" style="cursor: pointer, width: 30px; float: right" title="Excluir redação" onClick={this.removerRedacao.bind(this)}><i class="fa fa-trash"></i></div><div class="tag is-danger" style="width: 100px; float: right">Erro!</div></div>)

          let x = null;
          if( file.completed && file.success)
            x = success;
          else if( file.completed && file.error)
            x = fail;
          else if( file.completed && !file.error && !file.success)
            x = completed;
          else
             x = progress0;
             file_preview = (<div class="preview_upload">
               
                <table class="table is-striped" style="width:100%">
                  <tbody>
                      <tr key={file.uid} style="vertical-align: middle">
                        <td >
                          <figure class="image is-32x32" style="float:left; margin-right:20px; background-color:#E1E1E1" onClick={() => this.setState({ lightbox: file.preview })}>
                            <img src={file.preview} />
                          </figure>
                          <div style="margin-top:5px">
                          {file.tema.substr(0,25)}...
                            <div style="float:right">
                              {x}
                            </div>
                          </div>
                          
                        </td>
                      </tr>
                  </tbody>
                </table>
              </div>)
        }else{
          file_preview = (<div class="preview_upload"></div>)
        }
      return (
        <div>
          
          <Dropzone style={
            {
              display: visible
            }} 
            multiple={false} 
            accept="image/*, application/pdf"
            fmaxSize = {8000000}
            onDrop={this.onDrop.bind(this)}>
            <div class="button is-light has-text-centered.np">
              <i class=" fa fa-file "></i>
              <span style="margin-left:10px">Anexar redação <small><b>( tema:</b> <i>{this.state.tema.tema.substr(0,18)}...)</i></small></span>
            </div>
          </Dropzone>
          <aside>
             {file_preview}             
          </aside>
          {this.state.lightbox &&
                    <Lightbox
                        mainSrc={this.state.lightbox}
                        onCloseRequest={() => this.setState({ lightbox: null })}
                        
                    />
                }
        </div>
        )
    }
    
  }
}
