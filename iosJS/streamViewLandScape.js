/**
 * Created by yuanyuanzhao on 2017/7/7.
 */
import React ,{Component} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    NativeModules,
    ListView,
    NativeEventEmitter,
} from 'react-native';

var screen = require('Dimensions').get('window');
var scale = screen.width/375;
import ZYLiveBackGroundView from './nativeStreamView';

var myModule = NativeModules.ZYLiveBackGroundViewManager;

var imModule = NativeModules.IMCloud;
var im = new NativeEventEmitter(imModule);
var arr = [''];
export default class StreamViewLandScape extends Component {
    constructor(props){
        super(props);
        this.clickBack = this.clickBack.bind(this);
        this.clickFlash = this.clickFlash.bind(this);
        this.clickSwitch = this.clickSwitch.bind(this);
        this.clickBeauty = this.clickBeauty.bind(this);
        this.clickStart = this.clickStart.bind(this);
        this.renderMessages = this.renderMessages.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.scrollToEnd = this.scrollToEnd.bind(this);
        var ds = new ListView.DataSource({rowHasChanged:(r1,r2) => {r1 !== r2}});
        this.state = {
            flash:false,
            camera:false,
            beauty:false,
            steam:false,
            dataSource:ds,
            inputText:{
                'name':'',
                'message':''
            }
        }
        this.setupNativeComponent();
        imModule.startRongYunIM();
    }

    componentDidMount(){
        this.setState({
            dataSource:this.state.dataSource.cloneWithRows(arr)
        });
        setTimeout(this.scrollToEnd,500);
        console.log('添加观察者');
        im.addListener(
            'EventReminder',
            (data) => this.receiveMessage(data.userId , data.message),
            this
        );
    }

    setupNativeComponent(){
        console.log('这是水平页');
        console.log('directionButtonTag:',this.props.directionButtonTag);
        console.log('resolutionButtonTag:',this.props.resolutionButtonTag);
        console.log('url:',this.props.url);
        myModule.start(this.props.url,this.props.resolutionButtonTag.toString(),this.props.directionButtonTag.toString());
    }

    render(){
        return(
            <ZYLiveBackGroundView style={styles.background}>
                <View style={styles.downView}>
                    <View style={styles.messageView}>
                        <ListView dataSource={this.state.dataSource}
                                  renderRow={this.renderMessages}
                                  ref='messages'
                        ></ListView>
                    </View>
                    <TouchableOpacity onPress={()=>this.clickStart()}>
                        <Image source={(!this.state.steam ) ? require('../img/stream.png') :require('../img/streaming.png')} style={styles.videoImgStyle}></Image>
                    </TouchableOpacity>
                </View>

                <View style={styles.upperView}>

                    <TouchableOpacity onPress={()=>this.clickBack()}>
                        <Image source={require('../img/back.png')} style={styles.backStyle}></Image>
                    </TouchableOpacity>

                    <View style={styles.rightView}>
                        <TouchableOpacity onPress={()=>this.clickFlash()}>
                            <Image source={(this.state.flash == 0) ? require('../img/flash_off.png') :require('../img/flash_on.png')} style={styles.imgStyle}></Image>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.clickSwitch()}>
                            <Image source={require( '../img/switch_camera.png')} style={styles.imgStyle}></Image>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.clickBeauty()}>
                            <Image source={(this.state.beauty == 0) ? require('../img/beauty_off.png') :require('../img/beauty_on.png')} style={styles.imgStyle}></Image>
                        </TouchableOpacity>

                    </View>
                </View>

            </ZYLiveBackGroundView>
        )
    };

    renderMessages(data){
        if ( data == '' ){
            return (<Text>{data}</Text>);
        } else {
            return(<Text style={styles.textStyle}>{data.name +':'+ data.message}</Text>);
        }
    }

    receiveMessage(name,text){
        //收到消息刷新界面
        console.log('收到消息刷新界面'+name+'：'+text);
        this.setState({
            inputText:{
                name:name,
                message:text
            }
        });
        arr.push(this.state.inputText);
        this.setState({
            dataSource:this.state.dataSource.cloneWithRows(arr)
        });
        setTimeout(this.scrollToEnd,500);
    }

    scrollToEnd(){
        this.refs.messages.scrollToEnd({animated: true});
    }

    clickBack(){
        console.log('点击返回');
        myModule.onBack();
        this.props.navigator.pop();
    }


    async clickFlash(){
        console.log('点击闪光灯');
        var that = this;
        var events = myModule.onToggleFlash();
        events.then(function (events){
            console.log("进入then  events is ", events);
            if(events == '闪光灯打开'){
                that.setState({
                    flash:1
                });
            } else {
                that.setState({
                    flash:0
                });
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async clickSwitch(){
        console.log('点击转换相机');
        var events = myModule.onSwitchCamera();
        // events.then(function (events){
        //     console.log("转换相机方向成功 ", events);
        // }).catch(function (error) {
        //     console.log(error);
        // });
    }

    async clickBeauty(){
        console.log('点击美颜');
        var that = this;
        var events = myModule.onBeauty();
        events.then(function (events){
            console.log("进入then  events is ", events);
            if(events == '正在美颜'){
                that.setState({
                    beauty:1
                });
            } else {
                that.setState({
                    beauty:0
                });
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async clickStart(){
        console.log('点击开始录制');
        var that = this;
        var events = myModule.onToggleStream();
        events.then(function (events){
            console.log("进入then  events is ", events);
            if(events == '正在推流'){
                that.setState({
                    steam:1
                });
            } else {
                that.setState({
                    steam:0
                });
            }
        }).catch(function (error) {
            console.log(error);
        });
    }
}
const styles = StyleSheet.create({
    background:{
        width:screen.width,
        height:screen.height,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    upperView:{

        height:screen.height,
        backgroundColor:'transparent',
        flexDirection:'column',
        justifyContent:'space-between'
    },
    downView:{
        backgroundColor:'transparent',
        height:screen.height,
        flexDirection:'column',
        width:200*scale,
        justifyContent:'space-between',
        alignItems:'center'
    },
    backStyle:{
        width:50,
        height:50,
        transform:[{rotate:'90deg'}]
    },
    imgStyle:{
        width:50,
        height:50,
        marginTop:5,
        marginBottom:5,
        transform:[{rotate:'90deg'}]
    },
    videoImgStyle:{
        width:100*scale,
        height:100*scale,
        transform:[{rotate:'90deg'}]
    },
    rightView:{
        width:50,
        height:200*scale,
        marginBottom:30*scale,
        flexDirection:'column',
        justifyContent:'flex-end'
    },
    messageView:{
        backgroundColor:'rgba(105,105,105,0.5)',
        height:200*scale,
        width:screen.height/3*2,
        transform:[{rotate:'90deg'}]
    },
    textStyle:{
        color:'white'
    }
})