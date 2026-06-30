// app/Screens/profile/Questions.tsx
// Website page: /faq — Frequently Asked Questions accordion.
// Rebuilt: replaced old template that used QuestionsAccordion + old Header + SafeAreaView.
// Files modified: this file (full rebuild).
// Navigation: already registered as "Questions" in StackNavigator.
// Data: static FAQ list (backend has no FAQ API endpoint).
// Interaction: expandable accordion — tap question to expand/collapse answer.
// NOTE: root App.tsx provides SafeAreaView — use a plain View container.
import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, LayoutAnimation, UIManager, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQ {
  q: string;
  a: string;
  category?: string;
}

const FAQS: FAQ[] = [
  // Orders
  {
    category: 'Orders & Delivery',
    q: 'How do I place an order?',
    a: 'Browse our collection, add your favourite pieces to the cart, and proceed to checkout. You can pay online or choose Cash on Delivery (where available). You will receive an order confirmation by email/SMS.',
  },
  {
    category: 'Orders & Delivery',
    q: 'How long does delivery take?',
    a: 'Standard delivery takes 5–7 business days. Express delivery (2–3 business days) is available in select cities. Delivery timelines may vary during festivals or peak seasons.',
  },
  {
    category: 'Orders & Delivery',
    q: 'Can I track my order?',
    a: 'Yes. Go to Profile → My Orders, select your order, and tap "Track Order" to see real-time status and shipping updates.',
  },
  {
    category: 'Orders & Delivery',
    q: 'Can I modify or cancel my order after placing it?',
    a: 'Orders can be cancelled or modified within 12 hours of placement, before they are dispatched. Contact our support team immediately via the Contact Us page.',
  },
  // Products
  {
    category: 'Products & Purity',
    q: 'How do I verify the purity of the jewellery?',
    a: 'All our jewellery is BIS Hallmarked, ensuring certified purity. The hallmark details (purity, year, assaying centre) are clearly mentioned on each product page.',
  },
  {
    category: 'Products & Purity',
    q: 'What is the return policy?',
    a: 'We accept returns within 7 days of delivery for unworn, undamaged items in their original packaging. Customised or engraved pieces are non-returnable. Initiate a return from Profile → My Orders → Request Return.',
  },
  {
    category: 'Products & Purity',
    q: 'Do you offer customisation?',
    a: 'Yes! We offer customisation for select designs — including resizing, engravings, and metal/stone changes. Contact our store via the Contact Us page with your requirements.',
  },
  {
    category: 'Products & Purity',
    q: 'How is the price of gold jewellery calculated?',
    a: 'Gold jewellery price = (Weight in grams × Today gold rate) + Making charges + GST. Making charges vary by design. Today gold rates are updated daily on the app.',
  },
  // Payments
  {
    category: 'Payments',
    q: 'What payment methods are accepted?',
    a: 'We accept UPI, Net Banking, Credit/Debit cards, and Cash on Delivery (COD). All online payments are secured with 256-bit SSL encryption.',
  },
  {
    category: 'Payments',
    q: 'When will I receive my refund?',
    a: 'Refunds are processed within 5–7 business days of return approval. The amount is credited back to your original payment method. COD refunds are via bank transfer.',
  },
  {
    category: 'Payments',
    q: 'Is COD available?',
    a: 'Cash on Delivery is available for orders below ₹50,000 in select pin codes. Availability is shown at checkout based on your delivery address.',
  },
  // Account
  {
    category: 'Account & Security',
    q: 'How do I reset my password?',
    a: 'On the Sign In screen, tap "Forgot Password", enter your registered mobile number, and follow the OTP verification steps to set a new password.',
  },
  {
    category: 'Account & Security',
    q: 'How do I update my profile or address?',
    a: 'Go to Profile → Edit Profile to update your personal details. For addresses, go to Profile → My Addresses.',
  },
];

// Group FAQs by category
const grouped = FAQS.reduce<Record<string, FAQ[]>>((acc, faq) => {
  const cat = faq.category ?? 'General';
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(faq);
  return acc;
}, {});
const CATEGORIES = Object.keys(grouped);

const AccordionItem = ({ faq, isOpen, onToggle, C }: {
  faq: FAQ; isOpen: boolean; onToggle: () => void; C: any;
}) => (
  <View style={styles.item}>
    <TouchableOpacity
      style={styles.question}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={[styles.questionTxt, { color: C.title }]}>{faq.q}</Text>
      <Feather
        name={isOpen ? 'chevron-up' : 'chevron-down'}
        size={18}
        color={isOpen ? COLORS.primary : C.textLight}
      />
    </TouchableOpacity>
    {isOpen && (
      <View style={[styles.answer, { backgroundColor: C.input }]}>
        <Text style={[styles.answerTxt, { color: C.text }]}>{faq.a}</Text>
      </View>
    )}
  </View>
);

const Questions = () => {
  const navigation = useNavigation<any>();
  const { isDark, colors: C } = useTheme();
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  const toggle = useCallback((key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIdx((prev) => (prev === key ? null : key));
  }, []);

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]}>FAQ</Text>
        <View style={styles.hBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.intro, { color: C.text }]}>
          Have a question? Find quick answers below. Can't find what you're looking for?{' '}
          <Text
            style={styles.introLink}
            onPress={() => (navigation as any).navigate('ContactUs')}
          >
            Contact us
          </Text>
          .
        </Text>

        {CATEGORIES.map((cat) => (
          <View key={cat} style={styles.catBlock}>
            <View style={styles.catHeader}>
              <Feather name="folder" size={15} color={COLORS.primary} />
              <Text style={styles.catTitle}>{cat}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: C.card }]}>
              {grouped[cat].map((faq, i) => {
                const key = `${cat}-${i}`;
                return (
                  <React.Fragment key={key}>
                    <AccordionItem
                      faq={faq}
                      isOpen={openIdx === key}
                      onToggle={() => toggle(key)}
                      C={C}
                    />
                    {i < grouped[cat].length - 1 && <View style={[styles.divider, { backgroundColor: C.borderColor }]} />}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  hBtn:      { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle:    { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold },
  scroll:    { padding: SIZES.padding, paddingBottom: 40 },
  intro:     { ...FONTS.fontSm, lineHeight: 20, marginBottom: 20 },
  introLink: { color: COLORS.primary, ...FONTS.fontSemiBold },
  catBlock:  { marginBottom: 20 },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  catTitle:  { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary },
  card:      { borderRadius: 14, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  item:      {},
  question:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  questionTxt: { flex: 1, ...FONTS.fontSm, ...FONTS.fontSemiBold, lineHeight: 18 },
  answer:    { paddingHorizontal: 16, paddingBottom: 14 },
  answerTxt: { ...FONTS.fontSm, lineHeight: 20 },
  divider:   { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
});

export default Questions;
