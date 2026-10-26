import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Check, Globe, Sparkles } from 'lucide-react-native';
import C from '../../constants/colors';
import { getLanguage, setLanguage, t, LANGUAGE_OPTIONS } from '../../constants/translations';

const { width } = Dimensions.get('window');

export default function LanguageModal({ visible, onClose, onSelect }) {
  const currentLang = getLanguage();
  const [selectedLang, setSelectedLang] = useState(currentLang);

  React.useEffect(() => {
    if (visible) {
      setSelectedLang(getLanguage());
    }
  }, [visible]);

  const handleChoose = async (langCode) => {
    setSelectedLang(langCode);
    await setLanguage(langCode);
    if (onSelect) onSelect(langCode);
  };

  const handleConfirm = async () => {
    await setLanguage(selectedLang);
    if (onSelect) onSelect(selectedLang);
    if (onClose) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Icon */}
          <View style={styles.iconCircle}>
            <Globe size={26} color={C.gold || '#D97706'} strokeWidth={2.2} />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Language / Langue</Text>
          <Text style={styles.subtitle}>
            Select which language you would like the app to display in:
          </Text>
          <Text style={styles.subtitleFr}>
            Dans quelle langue souhaitez-vous afficher l'application ?
          </Text>

          {/* Options */}
          <View style={styles.optionsWrap}>
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = selectedLang === opt.code;
              return (
                <TouchableOpacity
                  key={opt.code}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleChoose(opt.code)}
                >
                  <View style={styles.flagWrap}>
                    <Text style={styles.flagText}>{opt.flag}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={styles.optionSub}>
                      {opt.code === 'en' ? 'Default English UI' : 'Interface complète en Français'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      isSelected && styles.checkCircleSelected,
                    ]}
                  >
                    {isSelected && <Check size={16} color="#fff" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmBtn}
            activeOpacity={0.85}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>
              {selectedLang === 'fr' ? 'Continuer (Continue)' : 'Continue (Continuer)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 16, 30, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 119, 6, 0.35)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.lux900 || '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  subtitleFr: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 20,
  },
  optionsWrap: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  optionCardSelected: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    borderColor: C.gold || '#D97706',
  },
  flagWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  flagText: {
    fontSize: 20,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: C.lux900 || '#0F172A',
    fontWeight: '800',
  },
  optionSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkCircleSelected: {
    backgroundColor: C.gold || '#D97706',
    borderColor: C.gold || '#D97706',
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: C.lux900 || '#0F172A',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
