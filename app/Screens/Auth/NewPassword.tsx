import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useEffect } from 'react';

type Props = StackScreenProps<RootStackParamList, 'NewPassword'>;

const NewPassword = ({ navigation }: Props) => {
    useEffect(() => {
        navigation.replace('SignIn');
    }, []);
    return null;
};

export default NewPassword;
