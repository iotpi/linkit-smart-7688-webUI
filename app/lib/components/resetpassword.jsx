import { default as React, PropTypes } from 'react';
import Radium from 'radium';
import Logo from '../../img/mediatek.png';
import mui from 'material-ui';
import appAction from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';

const {
  RaisedButton,
  TextField,
} = mui;
const ThemeManager = new mui.Styles.ThemeManager();
const Colors = mui.Styles.Colors;

const styles = {

  frame: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  img: {
    width: '200px',
  },

  block: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '300px',
    alignItems: 'center',
  },

  basicWidth: {
    width: '100%',
    textAlign: 'center',
  },
  panelTitle: {
    width: '100%',
    tapHighlightColor: 'rgba(0,0,0,0)',
    color: 'rgba(0, 0, 0, 0.498039)',
    fontSize: '16px',
    transform: 'perspective(1px) scale(0.75) translate3d(0px, -28px, 0)',
    transformOrigin: 'left top',
    marginBottom: '0px',
    marginTop: '40px',
  },

  panelContent: {
    width: '100%',
    borderBottom: '1px solid #D1D2D3',
    fontSize: '16px',
    marginTop: '-15px',
    paddingBottom: '5px',
  },

};

@Radium
export default class resetPasswordComponent extends React.Component {
  static propTypes = {
    errorMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    successMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      password: '',
      againPassword: '',
      showPassword: false,
      notPassPassword: false,
      modal: false,
      errorTitle: '',
      errorMsg: '',
    };
    this._handleResetPassword = ::this._handleResetPassword;
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme(),
    };
  }

  render() {
    let textType = 'password';
    let errorText;
    let showPasswordStyle = {
      width: '100%',
      marginBottom: '44px',
    };

    if (this.state.showPassword) {
      textType = 'text';
    }

    if (this.state.notPassPassword) {
      errorText = (
        <div>
          <p style={{
            color: '#69BE28',
            textAlign: 'left',
            marginTop: '2px',
          }}>{ __('Please use at least 6 and less or equal than 32 alphanumeric characters.') }</p>
        </div>
      );
      showPasswordStyle = {
        marginTop: '30px',
        width: '100%',
        marginBottom: '44px',
      };
    }

    return (
      <div style={ styles.frame }>
        <div style={ styles.block }>
          <p style={{
            lineHeight: '22px',
            marginTop: '40px',
            fontFamily: 'RionaSansLight,Arial,Helvetica,sans-serif',
          }}>{__('Welcome to')} <b>Ushine UP7201</b></p>
          <p style={{ color: '#69BE28', marginTop: '-10px' }}>{__('Please set a password.')}</p>
          { /*<TextField
            hintText={ __('Input your Account') }
            ref="password"
            value={ this.state.account }
            onChange={
              (e)=> {
                this.setState({
                  account: e.target.value,
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            style={ styles.basicWidth }
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            required
            minLength="6"
            floatingLabelText={__('Account')} /> */ }
        <h3 style={ styles.panelTitle }>{ __('Account') }</h3>
        <p style={ styles.panelContent }>admin(default)</p>
          <TextField
            hintText={ __('Please set a password') }
            type={ textType }
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            errorStyle={{ borderColor: Colors.amber700 }}
            style={ styles.basicWidth }
            required
            minLength="6"
            onChange={
              (e) => {
                if (e.target.value.length < 6) {
                  this.setState({ notPassPassword: true, password: e.target.value });
                } else {
                  this.setState({ password: e.target.value, notPassPassword: e.target.value.length <= 32 ? false : true });
                }
              }
            }
            errorText={ errorText }
            floatingLabelText=
            {
              <div>
                { __('Password') } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
          <div style={ showPasswordStyle }>
            <a
              onTouchTap={
                () => {
                  this.setState({
                    showPassword: !this.state.showPassword,
                  });
                }
              }
              style={{
                textAlign: 'left',
                color: Colors.amber700,
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: '14px',
              }}>{ __('SHOW PASSWORD') }</a>
          </div>
          <RaisedButton
            linkButton
            secondary
            label={ __('Submit') }
            backgroundColor={ Colors.amber700 }
            onTouchTap={ this._handleResetPassword }
            style={ styles.basicWidth } />
        </div>
      </div>
    );
  }

  _handleResetPassword() {
    const password = this.state.password;
    const account = this.state.account;
    
    if (password.length < 6) {
      return false;
    }

    if(this.state.notPassPassword) {
      return false;
    }
    /*if (account.length < 0) {
      return false;
    }*/

    // return appAction.resetPassword(account, password, window.session)
    return appAction.resetPassword('root', password, window.session)
    .then(() => {
      return AppDispatcher.dispatch({
        APP_PAGE: 'LOGIN',
        successMsg: __('You have set your password successfully, please sign in now.'),
        errorMsg: null,
      });
    })
    .catch((err) => {
      if (err === 'Connection failed') {
        return alert(__('The device is still in the restarting process. Please retry again when the restarting process is complete.') + __('Please make sure your host computer is in the same network as the device. You can’t access this page if it’s in a different network.'));
      }
    });
  }
}

resetPasswordComponent.childContextTypes = {
  muiTheme: React.PropTypes.object,
};

