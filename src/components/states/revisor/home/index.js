import { h, Component } from 'preact';


export default class RevisorHome extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (<section class="section">
          <div class="container has-text-centered">
            <h3 class="has-text-grey-darker is-size-5">Revise uma redação aleatória!</h3>
            <br />
            <a class="box-event" href="/revisor/revisar-uma-redacao" >
              <i class="fa fa-pencil-alt fa-5x"></i>
              <br />
            </a>
          </div>
        </section>)
    }
}
