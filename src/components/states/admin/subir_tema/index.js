import { h, Component } from 'preact';
import Dropzone from 'react-dropzone';
import * as reqwest from 'reqwest';
import * as xhr from 'xhr';
import * as uid from 'uid';
import { MessageBox, Input, Message, Loading, Notification } from 'element-react';
import 'element-theme-default';
import Lightbox from 'lightbox-react';
import root from 'window-or-global';

export default class AdminSubirTema extends Component{
  constructor(props){
    super(props);
    this.onDrop = this.onDrop.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.removerTema = this.removerTema.bind(this);
    this.setState({
        url: root.url_base+'/api/admin/subir-tema'
      , url_remover: root.url_base+'/api//admin/remover-tema/'
      , auth: props.auth
      , files: []
      , tema: props.tema});


  }
  componentWillReceiveProps(props) { ///////////// QUANDO O COMPONENTE FOR MONTADO
    this.setState({auth: props.auth, columns: props.columns, tema: props.tema, uploading: false})
  }
  onProgress(evt,e){
    let files = this.state.files.map( f => {
      if(f.uid == evt.currentTarget.uid){
        f.loaded = evt.loaded;
        if(f.loaded >= f.size){
          f.completed = true;
        }
      }
      return f;
    });
    this.setState({files: files})
  }
  onDrop(files) {
    if(files.length){
      let that = this;
      let titulo = this.state.novo_tema_titulo;
      let fs = this.state.files;
      let file = files[0];
      file.uid = uid(10);
      file.loaded = 0;
      file.title = titulo;
      file.success = false;
      file.completed = false;
      file.error = false;
      fs.push(file);
      this.setState({files: fs, uploading: true});

      let formData = new FormData();
      formData.append('file', file);
      formData.append('title', titulo);
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
            if(resp.statusCode == 200){
              let body = JSON.parse(resp.body);
              let sv = body;
              let file_uid = resp.rawRequest.upload.uid;
              let files = that.state.files.map( f => {
                if(f.uid == file_uid){
                    f.success = true;
                    f.completed = true;
                    f.id = sv.id;
                    f.data = sv;
                    f.url = sv.url;
                  }
                return f;
              });
              Notification({
                  message: (<small>Novo tema adicionado <b>{sv.title} </b>!</small>),
                  type: 'success'
                });
              that.setState({files: files})
            }else{
              let file_uid = resp.rawRequest.upload.uid;
              let files = that.state.files.map( f => {
                if(f.uid == file_uid){
                    f.error = true;
                    f.completed = true;
                  }
                return f;
              });
              that.setState({files: files})
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
  removerTema(file){
    let that = this;
    console.log(file)
    if(file.id){
      MessageBox.msgbox({
        title: 'Remover Redação?',
        message: ' Você tem certeza de que deseja remover esse tema  que você subiu? ',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
      }).then(action => {
        if(action == "confirm")
        {
          reqwest({
              url: this.state.url_remover + file.id
            , type: 'json'
            , method: 'delete'
            , headers: {
              'Authorization':'Bearer '+that.state.auth.jwt
            }
            , data: {}
            , crossOrigin: true
            })
          .then(function (resp) {
               Notification({
                  message: (<small>O tema #{file.id} foi Removido!</small>),
                  type: 'info'
                });
               let files = that.state.files.filter( x => { return x.id != file.id })
               that.setState({files: files})


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
    if(!this.state.novo_tema)
    {
      return (
          <div>
              <div class="has-text-grey has-text-centered">
                <div class="button is-success" onClick={e=>{
                    this.setState({novo_tema: true})
                  }}> Enviar um novo tema </div>
              </div>
          </div>
          )
    }
    else
    {

      let files = null;
      if(this.state.files.length)
      {
         files = (<div class="preview_upload">
            <div class="has-text-black is-uppercase has-text-weight-semibold" style="margin-top:20px;">
              Redações Enviadas agora
            </div>
            <table class="table is-striped" style="width:100%">
              <tbody>
                {
                  this.state.files.map(f => {
                    let ch = root.innerWidth/14;
                    let progress0 = (<progress class="progress" value={f.loaded} max={f.size} style="width: 100px; float: right"></progress>)

                    let completed = (<div class="tag is-warning" style="width: 100px; float: right">Processando</div>)

                    let success = (<div>

                      <div class="button is-success is-small np" style="width: 100px; float: right">Enviado</div>
                      <div class="button is-light is-small" style="cursor: pointer, width: 30px; float: right" title="Excluir redação" onClick={e => {
                        this.removerTema(f);
                      }}><i class="fa fa-trash"></i></div>
                      </div>)

                    let fail = (<div class="tag is-danger" style="width: 100px; float: right">Erro!</div>)

                    let x = null;
                    if( f.completed && f.success)
                      x = success;
                    else if( f.completed && f.error)
                      x = fail;
                    else if( f.completed && !f.error && !f.success)
                      x = completed;
                    else
                      x = progress0;
                    return (<tr key={f.uid} style="vertical-align: middle">
                    <td >
                      <div style="margin-top:5px">
                      {f.url && <a href={root.url_base+"/"+f.data.url} target="_blank">{f.title.substr(0,parseInt(ch))}...</a>}
                      {!f.url && <b>{f.title.substr(0,parseInt(ch))}...</b>}
                      {x}
                      </div>

                    </td>
                  </tr>)
                  })
                }
              </tbody>
            </table>
          </div>)
        }else{
          files = (<div class="preview_upload">
            <div class="has-text-grey is-uppercase has-text-weight-semibold" style="margin-top:20px;">
              Nenhuma redação enviada agora
            </div>
          </div>)
        }

      return (
        <div>
          <div class="has-text-primary is-uppercase has-text-weight-semibold" >
            Enviar novo tema
            <br />
            <input class="input" type="text" placeholder="Nome do tema aqui" onInput={e=>
              {
                if(e.target.value.length)
                  this.setState({novo_tema_titulo: e.target.value})
                else
                  this.setState({novo_tema_titulo: null})
              }}/>
          </div>
          {this.state.novo_tema_titulo && <Dropzone style={
            {
              width: "100%",
              margin: "auto",
              border: "1px solid #5A5A5A",
              textAlign: "center"
            }} disabled={!this.state.auth}
            accept="image/*, application/pdf"
            maxSize = {8000000}
            onDrop={this.onDrop.bind(this)}>
            <div class="has-text-centered.np">
              <br />
              <i class=" fa fa-file fa-3x"></i>
              <br />
              Coloque o novo tema aqui <br />ou clique para selecionar um tema no seu computador.
            </div>
          </Dropzone>}
          <aside>
             {files}
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
