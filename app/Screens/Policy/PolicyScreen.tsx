// app/Screens/Policy/PolicyScreen.tsx
// Website pages: /privacy-policy, /terms-and-conditions, /refund-policy,
//                /shipping-and-delivery, /cancellation-return, /why-choose-us, /risk-compliance.
// Single generic screen driven by route param `type`.
// Files created: app/Screens/Policy/PolicyScreen.tsx
// Files modified: RootStackParamList.tsx (add PolicyScreen type), StackNavigator.tsx (register).
// Navigation: accessible from Profile → Help & Policies section.
// Data: native RN text (static, per user choice). No API call required.
// NOTE: root App.tsx provides SafeAreaView — use a plain View container.
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export type PolicyType =
  | 'privacy'
  | 'terms'
  | 'refund'
  | 'shipping'
  | 'cancellation'
  | 'why-choose-us'
  | 'risk';

type Props = StackScreenProps<RootStackParamList, 'PolicyScreen'>;

interface PolicySection {
  heading?: string;
  body: string;
}

interface PolicyContent {
  title: string;
  lastUpdated?: string;
  sections: PolicySection[];
}

const POLICIES: Record<PolicyType, PolicyContent> = {
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'June 2025',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'We collect information you provide when registering an account, placing an order, or contacting us — including your name, email address, phone number, and delivery address. We also automatically collect certain device and usage data (such as IP address and browsing behaviour on our platform) to improve our services.',
      },
      {
        heading: 'How We Use Your Information',
        body: 'Your information is used to process orders, personalise your shopping experience, send order updates and promotional offers (with your consent), improve our products and services, and comply with legal obligations. We do not sell your personal data to third parties.',
      },
      {
        heading: 'Data Security',
        body: 'We implement industry-standard security measures including SSL/TLS encryption and restricted access controls to protect your data. However, no transmission over the internet is completely secure, and we encourage you to safeguard your account credentials.',
      },
      {
        heading: 'Cookies',
        body: 'Our platform uses cookies and similar technologies to remember your preferences, analyse traffic, and deliver a personalised experience. You can manage cookie preferences through your device or browser settings.',
      },
      {
        heading: 'Your Rights',
        body: 'You have the right to access, correct, or delete your personal information. To exercise these rights or withdraw consent for marketing communications, contact us at support@bmgjewellers.com.',
      },
      {
        heading: 'Contact',
        body: 'For privacy-related queries, email us at privacy@bmgjewellers.com or write to our registered address.',
      },
    ],
  },

  terms: {
    title: 'Terms & Conditions',
    lastUpdated: 'June 2025',
    sections: [
      {
        heading: 'Acceptance of Terms',
        body: 'By accessing or using the BMG Jewellers mobile application or website, you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use immediately.',
      },
      {
        heading: 'Account Registration',
        body: 'You must provide accurate, current, and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.',
      },
      {
        heading: 'Product Information & Pricing',
        body: 'We make every effort to display product details, images, and prices accurately. However, errors may occasionally occur. We reserve the right to correct prices and cancel orders placed at an erroneous price, with a full refund issued promptly.',
      },
      {
        heading: 'Intellectual Property',
        body: 'All content on this platform — including images, text, logos, and product designs — is the intellectual property of BMG Jewellers or its licensors. Unauthorised reproduction or commercial use is strictly prohibited.',
      },
      {
        heading: 'Limitation of Liability',
        body: 'BMG Jewellers shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services beyond the order value paid.',
      },
      {
        heading: 'Governing Law',
        body: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in [City], India.',
      },
    ],
  },

  refund: {
    title: 'Refund Policy',
    lastUpdated: 'June 2025',
    sections: [
      {
        heading: 'Eligibility for Refund',
        body: 'Refunds are applicable for items returned within 7 days of delivery that are unused, undamaged, and in their original packaging with all tags and certificates intact.',
      },
      {
        heading: 'Non-Refundable Items',
        body: 'Customised or engraved jewellery, items damaged due to misuse, and products without their original packaging or certificates are not eligible for refunds.',
      },
      {
        heading: 'Refund Process',
        body: 'Once we receive and inspect the returned item, we will notify you of the approval or rejection. Approved refunds are processed within 5–7 business days to your original payment method. COD refunds are issued via bank transfer.',
      },
      {
        heading: 'Exchange Option',
        body: 'If you prefer an exchange instead of a refund, our team will assist you in selecting an alternative piece of equal or higher value (with the difference payable).',
      },
      {
        heading: 'Initiating a Return',
        body: 'To initiate a return, go to Profile → My Orders → select the order → Request Return, or contact our support team within 7 days of delivery.',
      },
    ],
  },

  shipping: {
    title: 'Shipping & Delivery',
    lastUpdated: 'June 2025',
    sections: [
      {
        heading: 'Delivery Timelines',
        body: 'Standard delivery: 5–7 business days. Express delivery (select cities): 2–3 business days. Orders placed before 12:00 PM IST on weekdays are processed the same day.',
      },
      {
        heading: 'Shipping Charges',
        body: 'Free shipping on all orders above ₹2,000. A flat shipping fee of ₹99 applies on orders below ₹2,000. Express delivery charges are calculated at checkout based on your location.',
      },
      {
        heading: 'Delivery Partners',
        body: 'We ship via reputed courier partners including DTDC, Blue Dart, and FedEx. All shipments are fully insured and tracked.',
      },
      {
        heading: 'Order Tracking',
        body: 'Once your order is dispatched, you will receive a tracking link via SMS and email. You can also track your order in the app under Profile → My Orders → Track Order.',
      },
      {
        heading: 'Undeliverable Shipments',
        body: 'If a shipment is returned to us due to an incorrect address or failed delivery attempts, we will contact you to reschedule. Reshipping charges may apply.',
      },
      {
        heading: 'International Shipping',
        body: 'We currently ship within India only. International orders may be accommodated on a case-by-case basis — please contact us for more information.',
      },
    ],
  },

  cancellation: {
    title: 'Cancellation & Return',
    lastUpdated: 'June 2025',
    sections: [
      {
        heading: 'Order Cancellation',
        body: 'Orders can be cancelled within 12 hours of placement, provided they have not yet been dispatched. To cancel, go to Profile → My Orders and select "Cancel Order", or contact our support team immediately.',
      },
      {
        heading: 'Post-Dispatch Cancellations',
        body: 'Once an order is dispatched, cancellation is not possible. In such cases, you may refuse the delivery and initiate a return upon delivery.',
      },
      {
        heading: 'Returns — Eligibility',
        body: 'Items are eligible for return within 7 days of delivery if they are unused, undamaged, and in original packaging. Customised items are non-returnable.',
      },
      {
        heading: 'Return Process',
        body: '1. Initiate a return request via Profile → My Orders → Request Return.\n2. Our team will review and confirm pick-up within 24–48 hours.\n3. A courier will collect the item from your address.\n4. Upon receipt and quality check, your refund or exchange will be processed.',
      },
      {
        heading: 'Damaged or Defective Items',
        body: 'If you receive a damaged or defective product, please contact us within 48 hours of delivery with photographs. We will arrange an immediate replacement or full refund.',
      },
    ],
  },

  'why-choose-us': {
    title: 'Why Choose Us',
    sections: [
      {
        heading: 'BIS Hallmarked Jewellery',
        body: 'Every piece we sell is BIS Hallmarked, guaranteeing certified purity. Our commitment to quality means you can buy with complete confidence.',
      },
      {
        heading: 'Exquisite Craftsmanship',
        body: 'Our jewellery is crafted by skilled artisans using traditional techniques blended with modern design sensibilities — resulting in pieces that are timeless and extraordinary.',
      },
      {
        heading: 'Transparent Pricing',
        body: 'We believe in honest, transparent pricing. Our product pages clearly show today\'s gold rate, making charges, and GST — so you always know exactly what you\'re paying for.',
      },
      {
        heading: 'Secure & Convenient Shopping',
        body: 'Shop from anywhere with our secure app and website. All payments are protected with 256-bit SSL encryption, and we never store your card details.',
      },
      {
        heading: 'Hassle-Free Returns',
        body: 'We stand behind every product we sell. Our 7-day return policy ensures that if you\'re not completely satisfied, returning or exchanging your jewellery is simple and stress-free.',
      },
      {
        heading: 'Dedicated Customer Support',
        body: 'Our customer care team is available 6 days a week to help you with product queries, customisation requests, and after-sales support.',
      },
    ],
  },

  risk: {
    title: 'Risk & Compliance',
    lastUpdated: 'June 2025',
    sections: [
      {
        heading: 'Regulatory Compliance',
        body: 'BMG Jewellers complies with all applicable laws and regulations in India, including the Bureau of Indian Standards (Hallmarking) Order, Consumer Protection Act 2019, and Information Technology Act 2000.',
      },
      {
        heading: 'Anti-Money Laundering (AML)',
        body: 'In accordance with Prevention of Money Laundering Act (PMLA) requirements, we collect KYC information for high-value transactions above ₹2,00,000. All transactions are monitored for suspicious activity.',
      },
      {
        heading: 'Data Protection',
        body: 'We adhere to applicable data protection standards and do not transfer personal data to third parties without consent, except as required by law or for order fulfilment.',
      },
      {
        heading: 'Product Risk Disclosure',
        body: 'Gold and precious metal prices fluctuate daily. The value of jewellery purchased may vary over time based on market conditions. We recommend purchasing jewellery for personal use rather than short-term investment.',
      },
      {
        heading: 'GST & Taxation',
        body: 'All prices on our platform include applicable GST. A valid GST invoice is provided with every order. For business purchases requiring GST credit, please provide your GSTIN at checkout.',
      },
      {
        heading: 'Dispute Resolution',
        body: 'In the event of a dispute, we encourage resolution through direct communication with our customer support team. Unresolved disputes may be referred to consumer forums under the Consumer Protection Act 2019.',
      },
    ],
  },
};

const PolicyScreen = ({ route, navigation }: Props) => {
  const { type } = route.params;
  const policy = POLICIES[type];
  const { isDark, colors: C } = useTheme();

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]} numberOfLines={1}>{policy?.title ?? 'Policy'}</Text>
        <View style={styles.hBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {policy?.lastUpdated && (
          <Text style={[styles.lastUpdated, { color: C.textLight }]}>Last updated: {policy.lastUpdated}</Text>
        )}

        {policy?.sections.map((sec, i) => (
          <View key={i} style={styles.section}>
            {!!sec.heading && (
              <Text style={[styles.heading, { color: C.title }]}>{sec.heading}</Text>
            )}
            <Text style={[styles.body, { color: C.text }]}>{sec.body}</Text>
          </View>
        ))}

        {!policy && (
          <Text style={[styles.body, { color: C.text }]}>Content not available.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  hBtn:        { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle:      { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold },
  scroll:      { padding: SIZES.padding, paddingBottom: 48 },
  lastUpdated: { ...FONTS.fontXs, marginBottom: 20, fontStyle: 'italic' },
  section:     { marginBottom: 20 },
  heading:     { fontFamily: 'MarcellusRegular', fontSize: 16, marginBottom: 8 },
  body:        { ...FONTS.fontSm, lineHeight: 22 },
});

export default PolicyScreen;
