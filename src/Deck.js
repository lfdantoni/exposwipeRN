import React from 'react'
import { 
    View, 
    Animated,
    PanResponder,
    Dimensions,
    LayoutAnimation,
    UIManager
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends React.Component{
    static defaultProps = {
        onSwipeLeft: () => {},
        onSwipeRight: () => {},
        renderNoMoreCards: () => {}
    }

    constructor(props){
        super(props);

        const position = new Animated.ValueXY();
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy });
            },
            onPanResponderRelease: (event, gesture) => {
                if(gesture.dx > SWIPE_THRESHOLD){
                    this.forceSwipe('right');
                }else if(gesture.dx < -SWIPE_THRESHOLD){
                    this.forceSwipe('left');
                }else{
                    this.resetPosition();
                }
            }
        });

        this.state = { panResponder, position, index: 0 }
    }

    forceSwipe(direction){
        const move = direction == 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

        Animated.timing(this.state.position, {
            toValue: { x: move, y: 0},
            duration: SWIPE_OUT_DURATION
        }).start(() => this.swipeComplete(direction));
    }

    swipeComplete(direction){
        const { onSwipeLeft, onSwipeRight, data } = this.props;
        const item = data[this.state.index];

        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
        this.state.position.setValue({ x: 0, y: 0});
        this.setState({index: this.state.index + 1 });
    }

    resetPosition(){
        Animated.spring(this.state.position, {
            toValue: { x:0, y: 0}
        }).start();
    }

    getCardStyle(){
        const { position } = this.state;
        const limit = SCREEN_WIDTH*1.5;

        const rotate = position.x.interpolate({
            inputRange: [-limit,0,limit],
            outputRange: ['-120deg','0deg', '120deg']
        })
        return {
            ...this.state.position.getLayout(),
            transform: [{ rotate }]
        }
    }

    componentWillUpdate(){
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.spring();
    }

    hola(numero: number){
        
    }

    renderCards(){
        if(this.state.index >= this.props.data.length){
            return this.props.renderNoMoreCards();
        }

        return this.props.data.map( (item, index) => {
            if(this.state.index <= index){
                if(index === this.state.index){
                    return (
                        <Animated.View
                            key={item.id}
                            style={[this.getCardStyle(), styles.cardStyle]}
                            {...this.state.panResponder.panHandlers}>
                            {this.props.renderCard(item)}
                        </Animated.View>
                    )
                }
                return (
                    <Animated.View 
                        key={item.id} 
                        style={[styles.cardStyle, {top: 10*(index - this.state.index)}]}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                    
                );
            }
            
        }).reverse()
    }

    render(){
        return(
            <Animated.View>
                {this.renderCards()}
            </Animated.View>
                    
        )
    }
}

const styles = {
    cardStyle: {
        position: 'absolute',
        width: SCREEN_WIDTH
    }
}

export { Deck }