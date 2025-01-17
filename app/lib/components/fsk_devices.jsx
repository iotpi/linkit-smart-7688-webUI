import { default as React, PropTypes } from 'react';
import Radium from 'radium';
import mui from 'material-ui';
import AppActions from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';
import Dropzone from 'react-dropzone';

const {
  Checkbox,
  TextField,
  Card,
  FlatButton,
  RadioButtonGroup,
  RadioButton,
  RaisedButton,
  SelectField,
  Dialog,
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
  TableFooter,
  List,
  ListItem,
  Popover
} = mui;

const ThemeManager = new mui.Styles.ThemeManager();
const Colors = mui.Styles.Colors;
const styles = {

  content: {
    paddingRight: '128px',
    paddingLeft: '128px',
    '@media (max-width: 760px)': {
      paddingRight: '20px',
      paddingLeft: '20px',
    },
  },
};

const channels = [{text: "Ch 1", payload: '1'}, {text: "Ch 2", payload: '2'}];

@Radium
export default class networkComponent extends React.Component {
  static propTypes = {
    errorMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    successMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    boardInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }
  constructor(props) {
    super(props);

    this.state = {
      modal: true,
      errorMsgTitle: null,
      errorMsg: null,
      udid_map: [],
      udidMapPopOpen: false,
      currentUdidMapDevice: {
        addr: "",
        udid: "",
      },
    };

    this.state.files = [{ name: '' }];
    
    this.state.input = {
      addr: null,
      // no: null,
      chan: null,
    };
    this.state.devices = [];
    this.state.devicesFileSelected = false;
    
    this._handleAddDevice = ::this._handleAddDevice;
    this._handleDeleteDevice = ::this._handleDeleteDevice;
    this._handleSaveDevices = ::this._handleSaveDevices;
    this._handleUploadDevicesList = ::this._handleUploadDevicesList;
    this._handleOnCheck = ::this._handleOnCheck;
    this._cancelErrorMsgDialog = ::this._cancelErrorMsgDialog;
    this._onDrop = ::this._onDrop;
  }

  componentWillMount() {
    const this$ = this;

    ThemeManager.setComponentThemes({
      textField: {
        focusColor: Colors.amber700,
      },
      menuItem: {
        selectedTextColor: Colors.amber700,
      },
      radioButton: {
        backgroundColor: '#00a1de',
        checkedColor: '#00a1de',
      },
    });
    AppActions.loadFskDevices(window.session)
      .then((data) => {
        let r = data.body.result[1].data;
        let d = r.split(/\r?\n/);
        let devices = d.filter((value) => {
          if(value.trim().length == 0) {
            return false;
          } else {
            return true;
          }
        });
        devices = devices.map((value) => {
            let i = value.split(/,/);
            return {
              addr: i[0],
              // no: i[1],
              chan: i[1],
              checked: false,
            }
        });
        // console.log(devices);
        return this$.setState({ devices: devices });
      });

    AppActions.loadUdidMap(window.session)
      .then((data) => {
        // console.log("udid_map array: ", data);
        this$.setState({ udid_map: data });
      });
  }

  resetSelectedDevices(devices) {
    for(let index in devices) {
      devices[index].checked = false;
    }
    this.setState({
      devices: devices,
    });
    return devices;
  }
  
  _handleAddDevice() {

    let device = {
      addr: this.state.input.addr,
      // no: this.state.input.no,
      chan: this.state.input.chan,
      checked: false,
    };

    if(this.state.devices.length >= 150) {
      this.setState({
        errorMsgTitle: __('Error'),
        errorMsg: __("Device No. can not be greater than 150"),
      });
      return this.refs.errorDialog.show();
    }

    if(null == device.addr || device.addr.length == 0) {
        this.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Device Addr is empty"),
        });
        return this.refs.errorDialog.show();
    } else {
      if(!/^[0-9a-fA-F]{8}$/g.test(device.addr)) {
        this.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Node Addr is should be 8 hex digits"),
        });
        return this.refs.errorDialog.show();
      }/* else if(/[0-9a-fA-F]{9,}/g.test(device.addr)) {
        this$.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Node Addr is too large, should be 4 bytes, or 8 hex digits"),
        });
        return this$.refs.errorDialog.show();
      }*/
    }

    /*
    if(null == device.no || device.no.length == 0) {
        this.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Device No. is empty"),
        });
        return this.refs.errorDialog.show();
    } else {
      if(!/[0-9]+/g.test(device.no)) {
        this.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Device No. is not number"),
        });
        return this.refs.errorDialog.show();
      }

      if(parseInt(device.no) >= 150) {
        this.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Device No. can not be greater than 150"),
        });
        return this.refs.errorDialog.show();
      }
    }
    */
    if(null == device.chan) {
        this.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Please choose device channel"),
        });
        return this.refs.errorDialog.show();
    }      
    
    let devices = this.state.devices;
    let found = devices.find(d => d.addr == device.addr/* || d.no == device.no*/);
    if(found != undefined) {
        alert(__("Device Addr should be unique"));
        return;
    }
    devices.push(device);
    /*devices.sort((d1, d2) => {
      return d1.no > d2.no;
    });*/

    devices = this.resetSelectedDevices(devices);
  }
  _handleDeleteDevice() {
    let devices = this.state.devices.filter((e) => e.checked == false) ;
    this.resetSelectedDevices(devices);
  }

  _handleSaveDevices() {
    let devices = this.state.devices;
    // console.log(devices);
    AppActions.setFskDevices(devices, window.session);
    this.resetSelectedDevices(devices);
  }

  _handleUploadDevicesList(file) {
    // console.log("file: ", file);
    const this$ = this;
    this.setState({
      uploadDevices: true,
    });
    this.refs.uploadDialog.show();
    return AppActions.uploadDevicesList(file, window.session)
    .then(() => {
      return AppActions.loadTempDevicesList(window.session);
    })
    .then((data) => {
      return AppActions.checkDevicesList(data, window.session);
    })
    .then((res) => {
      // console.log("upload devices list reply: ", res);
      this$.refs.uploadDialog.dismiss();
      if(res.length == 1) {
        return res[0];
      } else if(res.length == 2) {
        let devices = res[0];
        let index = res[1];
        this$.setState({ errorMsgTitle: __('Invalid Devices List'), errorMsg: 'Line: ' + index + ' has incorrect format(' + devices[index].addr + ')'});
        this$.refs.errorDialog.show();
        return false;
      }
    })
    .then((res) => {
      if(res == false) {
        return false;
      } else {
        return AppActions.checkDuplicatedDevices(res, window.session);
      }
    })
    .then((res) => {
      if(res.length == 1) {
        return res[0];
      } else if(res.length == 2) {
        let devices = res[0];
        let index = res[1];
        this$.setState({ errorMsgTitle: __('Invalid Devices List'), errorMsg: 'Line: ' + index + ' has duplicated device(' + devices[index].addr + ')'});
        this$.refs.errorDialog.show();
        return false;
      }
    })
    .then((res) => {
      if(res == false) {
        return false;
      } else {
        if(res.length > 150) {
          this$.setState({ errorMsgTitle: __('Invalid Devices List'), errorMsg: __("Device No. can not be greater than 150")});
          this$.refs.errorDialog.show();
          return false;
        } else {
          // console.log("setFskDevices: ", res);
          AppActions.setFskDevices(res, window.session);
          this$.setState({
            devices: res,
          });
          return true;
        }
      }
    })
    .catch((err) => {
      this$.refs.uploadDialog.dismiss();
      if (err === 'Access denied') {
        this$.setState({ errorMsgTitle: __('Access denied'), errorMsg: __('Your token was expired, please sign in again.') });
        return this$.refs.errorDialog.show();
      }
      alert(err);
    });
  }

  _handleOnCheck(checked, index) {
    // console.log("onCheck: ", index, " checked:", checked, " d: ", this.state.devices[index].checked);
    let devices = this.state.devices;
    devices[index].checked = checked;
    this.setState({
      devices: devices,
    });
  }
  handleRequestClose = () => {
    this.setState({
      udidMapPopOpen: false,
    });
  };

  componentDidMount() {
    return true;
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme(),
    };
  }

  _cancelErrorMsgDialog() {
    this.refs.errorDialog.dismiss();
  }

  _onDrop(files) {
    // console.log("onDrop: ", files);
    this.setState({
      files: files,
      devicesFileSelected: true,
    });
  }

  render() {

    let DropzoneContent = (
      <div>
        <h3 style={{
              tapHighlightColor: 'rgba(0,0,0,0)',
              color: 'rgba(0,0,0,0.5)',
              fontSize: '16px',
              transform: 'perspective(1px) scale(0.75) translate3d(2px, -28px, 0)',
              transformOrigin: 'left top',
              marginBottom: '0px',
              marginTop: '40px'}}>{__("Devices List File")}</h3>
        <p style={{
             borderBottom: '1px solid #D1D2D3',
             fontSize: '16px',
             marginTop: '-10px',
             paddingBottom: '5px',
           }}>{ this.state.files[0].name || __('Choose the file') }</p>
      </div>
    );

    const errMsgActions = [
      <FlatButton
        label={__('Dismiss')}
        labelStyle={{ color: Colors.amber700 }}
        onTouchTap={ this._cancelErrorMsgDialog }
        hoverColor="none" />,
    ];

    let this$ = this;
    return (
      <div>
        <Dialog
          title={ this.state.errorMsgTitle }
          actions={ errMsgActions }
          actionFocus="submit"
          ref="errorDialog"
          modal={ this.state.modal }>
          <p style={{ color: '#999A94', marginTop: '-20px' }}>{ this.state.errorMsg }</p>
        </Dialog>
        <Dialog
          title={ __('Upload Devices') }
          ref="uploadDialog"
          modal={ this.state.uploadDevices }>
          <p>{ __('Uploading ...') }</p>
        </Dialog>
        <Card>
          <div style={ styles.content } key="card1">
          <h3>{__("Nodes List")}</h3>
            <TextField
              type="text"
              value={ this.state.input.addr }
              style={{ width: '100%' }}
              onChange={
                (e) => {
                  this.setState({
                    input: {
                      addr: e.target.value,
                      // no: this.state.input.no,
                      chan: this.state.input.chan,
                    }
                  });
                }
              }
              underlineFocusStyle={{ borderColor: Colors.amber700 }}
              floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
              floatingLabelText={
                <div>
                  { __("Device Address") } <b style={{ color: 'red' }}>*</b>
                </div>
              } />
            {/*<TextField
              type="text"
              value={ this.state.input.no }
              style={{ width: '100%' }}
              onChange={
                (e) => {
                  this.setState({
                    input: {
                      addr: this.state.input.addr,
                      no: e.target.value,
                      chan: this.state.input.chan,
                    }
                  });
                }
              }
              underlineFocusStyle={{ borderColor: Colors.amber700 }}
              floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
              floatingLabelText={
                <div>
                  { __("Device No.") } <b style={{ color: 'red' }}>*</b>
                </div>
                } />*/}
          <SelectField
            value={ this.state.input.chan }
            menuItems={ channels }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                  this.setState({
                    input: {
                      addr: this.state.input.addr,
                      // no: this.state.input.no,
                      chan: e.target.value,
                    }
                  });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={ __("Device Channel") }
          />
          <div style={{
                 display: 'flex',
                 flexDirection: 'row',
                 justifyContent: 'space-between',
               }}>
            <RaisedButton
              linkButton
              secondary
              label={__('Add')}
              backgroundColor={ Colors.amber700 }
              onTouchTap={ this._handleAddDevice }
              style={{
                width: '236px',
                flexGrow: 1,
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: '20px',
                marginLeft: '10px',
              }} />
          </div>
          <div style={{
                 display: 'flex',
                 flexDirection: 'row',
                 justifyContent: 'space-between',
               }}>
          </div>
            <List>
            {
              this.state.devices.map(
                (device, index) => <ListItem
                                     leftCheckbox={
                                       <Checkbox
                                         onCheck={ (e, checked) => { this._handleOnCheck(checked, index) }}
                                         checked = { device.checked }/>
                                     }
                                     primaryText={`${device.addr},${device.chan}`}></ListItem>
              )
            }
          </List>
            <div style={{
                   display: 'flex',
                   flexDirection: 'row',
                   justifyContent: 'space-between',
                 }}>
              <RaisedButton
                linkButton
                secondary
                label={__('Delete Selected')}
                backgroundColor={ Colors.amber700 }
                onTouchTap={ this._handleDeleteDevice }
                style={{
                  width: '236px',
                  flexGrow: 1,
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '20px',
                  marginLeft: '10px',
                }} />
            </div>
          </div>
        </Card>
        <Card>
          <div style={ styles.content } key="card2">
            <div style={{
                   display: 'flex',
                   flexDirection: 'row',
                   justifyContent: 'space-between',
                 }}>
              <RaisedButton
                linkButton
                secondary
                label={__('Save Devices to file')}
                backgroundColor={ Colors.amber700 }
                onTouchTap={ this._handleSaveDevices }
                style={{
                  width: '236px',
                  flexGrow: 1,
                  textAlign: 'center',
                  marginTop: '40px',
                  marginBottom: '20px',
                  marginLeft: '10px',
                }} />
            </div>
          </div>
        </Card>
        <Card>
          <div style={ styles.content } key="cardUploadDevicesList">
            <Dropzone onDrop={ this._onDrop } style={{ width: '100%', cursor: 'pointer' }}>
              { DropzoneContent }
            </Dropzone>
            <div style={{
                   display: 'flex',
                   flexDirection: 'row',
                   justifyContent: 'space-between',
                 }}>
              <RaisedButton
                linkButton
                secondary
                label={__('Upload Devices List file')}
                backgroundColor={ Colors.amber700 }
                disabled = { !this.state.devicesFileSelected }
                onTouchTap={
                  () => {
                    this._handleUploadDevicesList(this.state.files[0]);
                  }
                }
                style={{
                  width: '236px',
                  flexGrow: 1,
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '20px',
                  marginLeft: '10px',
                }} />
            </div>
          </div>
        </Card>
      {/*<Popover
        open={this.state.udidMapPopOpen}
        anchorEl={this.state.udidMapAnchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={this.handleUdidMapClose}
      >
        {
          this.state.currentUdidMapDevice.udid
        }
        </Popover>*/}
        <Card>
          <div style={ styles.content } key="cardUdidMap">
            <h3>{__("Nodes Udid Map")}</h3>
            <List>
            {
              this.state.udid_map.map(
                (device, index) => <ListItem
                                     primaryText={device.addr}
                                     secondaryText={`UDID: ${device.udid}`}
                                   />
              )
            }
              {/*onClick={(event) => {
                 event.preventDefault();

                 this$.setState({
                 currentUdidMapDevice: device,
                 udidMapPopOpen: true,
                 udidMapAnchorEl: event.currentTarget,
                 });
                 }}*/}
          </List>
          </div>
        </Card>
      </div>
    );
  }
}

networkComponent.childContextTypes = {
  muiTheme: React.PropTypes.object,
};
