import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux'
import store from './app/redux/store';
import Route from './app/Navigations/Route';
import { ToastProvider } from './app/components/commoncomponents/Toast';

export default function App() {

  const [loaded] = useFonts({
    JostBold: require('./app/assets/fonts/Jost-Bold.ttf'),
    JostSemiBold : require('./app/assets/fonts/Jost-SemiBold.ttf'),
    JostLight : require('./app/assets/fonts/Jost-Light.ttf'),
    JostMedium : require('./app/assets/fonts/Jost-Medium.ttf'),
    JostRegular : require('./app/assets/fonts/Jost-Regular.ttf'),
    JostExtraLight : require('./app/assets/fonts/Jost-ExtraLight.ttf'),
    MarcellusRegular : require('./app/assets/fonts/Marcellus-Regular.ttf'),
  });  

  if(!loaded){
    return null;
  }
  return (
    <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <Provider store={store}>
              <ToastProvider>
                <Route/>
              </ToastProvider>
            </Provider>
        </SafeAreaView>
    </SafeAreaProvider>
  );
}
