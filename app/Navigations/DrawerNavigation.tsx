import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomNavigation from './BottomNavigation';
import Sidebar from '../layout/Sidebar';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
    return (
        <Drawer.Navigator
            initialRouteName='BottomNavigation'
            screenOptions={{ headerShown: false }}
            drawerContent={(props) => <Sidebar navigation={props.navigation} />}
        >
            <Drawer.Screen name='BottomNavigation' component={BottomNavigation} />
        </Drawer.Navigator>
    );
};

export default DrawerNavigation;