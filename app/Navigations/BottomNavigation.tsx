import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screens/Home/Home';
import BottomTab from '../layout/BottomTab';
import MyCart from '../Screens/MyCart/MyCart';
import Category from '../Screens/Category/Category';
import Profile from '../Screens/profile/Profile';
import { BottomTabParamList } from './BottomTabParamList';
import Wishlist from '../Screens/Wishlist/Wishlist';


const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomNavigation = () => {

    // const theme = useTheme();
    // const { colors } = theme;
 
    return (
        <Tab.Navigator
            initialRouteName='Home'
            screenOptions={{
                headerShown : false
            }}
            tabBar={(props:any) => <BottomTab {...props}/>}
        >
            <Tab.Screen 
                name="Home" 
                component={HomeScreen} 
            />
            <Tab.Screen 
                name="Wishlist" 
                component={Wishlist} 
            />
            <Tab.Screen 
                name="MyCart" 
                component={MyCart} 
            />
            <Tab.Screen 
                name="Category" 
                component={Category} 
            />
            <Tab.Screen 
                name="Profile" 
                component={Profile} 
            />
        </Tab.Navigator>
    );
};

export default BottomNavigation;