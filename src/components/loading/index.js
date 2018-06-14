import { h, Component } from 'preact';
import ls from '../../images/ls.png';

export default class Loading extends Component {
    constructor(props) {
        super(props);
    }
    render(props, _) {
        return (
            <div id="loading">
                <div class="content">
                    <img class="logo fa-spin" src={ls}/>
                    <br />
                    {props.text}
                </div>
            </div>)
    }
}