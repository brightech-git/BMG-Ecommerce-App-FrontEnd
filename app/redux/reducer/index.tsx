import { combineReducers } from 'redux';
import drawerReducer from './drawerReducer';
import cartReducer from './cartReducer';
import wishListReducer from './wishListReducer';
import authReducer from './authReducer';

const rootReducer = combineReducers({
    drawer: drawerReducer,
    cart: cartReducer,
    wishList: wishListReducer,
    auth: authReducer,
});

export default rootReducer;