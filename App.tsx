import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getAgents, getServices, formatPrice, normalizeImages, priceNumber, serviceWebUrl } from './src/api';
import { colors } from './src/theme';
import type { Agent, Service, TabKey } from './src/types';

const filters = ['All', 'Dominican Republic', 'Mexico', 'Jamaica', 'Aruba', 'Bahamas', 'Hawaii', 'United States', 'Cruise'];

const exploreItems = [
  { icon: '🏨', title: 'Stays', subtitle: 'Hotels & resorts', url: 'https://avide.travel/hotels' },
  { icon: '✈️', title: 'Flights', subtitle: 'Search airfare', url: 'https://avide.travel/flights' },
  { icon: '🌴', title: 'Vacation Deals', subtitle: 'Agent package offers', url: 'https://avide.travel/services' },
  { icon: '🚗', title: 'Car Rentals', subtitle: 'Cars at your destination', url: 'https://avide.travel/carrentals' },
  { icon: '🛳️', title: 'Cruises', subtitle: 'Ocean & island escapes', url: 'https://avide.travel/cruises' },
  { icon: '🎟️', title: 'Concerts & Sports', subtitle: 'Event tickets', url: 'https://avide.travel/concert_sport' },
  { icon: '🗺️', title: 'Tours & Attractions', subtitle: 'Things to do', url: 'https://avide.travel/tours' },
  { icon: '💡', title: 'Travel Tips', subtitle: 'Useful planning guides', url: 'https://avide.travel/blog/travel-tips' },
];

function App() {
  const [tab, setTab] = useState<TabKey>('home');
  const [services, setServices] = useState<Service[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Service | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const [serviceRows, agentRows] = await Promise.all([getServices(), getAgents()]);
      setServices(serviceRows);
      setAgents(agentRows);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load live travel deals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const featured = useMemo(() => services.slice(0, 8), [services]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.shell}>
        <Header onLogoPress={() => setTab('home')} />
        <View style={styles.content}>
          {tab === 'home' && (
            <HomeScreen
              featured={featured}
              loading={loading}
              error={error}
              onOpenDeal={setSelected}
              onSeeDeals={() => setTab('deals')}
              onExplore={() => setTab('explore')}
              refreshing={refreshing}
              onRefresh={() => load(true)}
            />
          )}
          {tab === 'deals' && (
            <DealsScreen
              services={services}
              loading={loading}
              error={error}
              refreshing={refreshing}
              onRefresh={() => load(true)}
              onOpenDeal={setSelected}
            />
          )}
          {tab === 'explore' && <ExploreScreen />}
          {tab === 'contact' && <ContactScreen />}
        </View>
        <BottomTabs active={tab} onChange={setTab} />
      </View>
      <DealModal service={selected} agents={agents} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

function Header({ onLogoPress }: { onLogoPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onLogoPress} style={styles.logoRow}>
        <Image source={{ uri: 'https://avide.travel/avidelogo.png' }} style={styles.logo} resizeMode="contain" />
        <View>
          <Text style={styles.brand}>AvideTravel</Text>
          <Text style={styles.tagline}>Your journey starts here</Text>
        </View>
      </Pressable>
      <Pressable style={styles.helpPill} onPress={() => Linking.openURL('https://avide.travel/contact')}>
        <Text style={styles.helpText}>Need help?</Text>
      </Pressable>
    </View>
  );
}

function HomeScreen({
  featured,
  loading,
  error,
  onOpenDeal,
  onSeeDeals,
  onExplore,
  refreshing,
  onRefresh,
}: {
  featured: Service[];
  loading: boolean;
  error: string;
  onOpenDeal: (service: Service) => void;
  onSeeDeals: () => void;
  onExplore: () => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenPad}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.hero}>
        <Image source={{ uri: 'https://avide.travel/front.jpg' }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>TRAVEL SMARTER</Text>
          <Text style={styles.heroTitle}>Dream trips, real agents, better deals.</Text>
          <Text style={styles.heroSubtitle}>Flights, resorts, cruises and vacation packages in one place.</Text>
          <View style={styles.heroButtons}>
            <Pressable style={styles.primaryButton} onPress={onSeeDeals}>
              <Text style={styles.primaryButtonText}>View Deals</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={onExplore}>
              <Text style={styles.ghostButtonText}>Explore</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <SectionTitle title="Plan your trip" subtitle="Everything you need in one app" />
      <View style={styles.quickGrid}>
        <QuickAction icon="🏨" label="Hotels" onPress={() => Linking.openURL('https://avide.travel/hotels')} />
        <QuickAction icon="✈️" label="Flights" onPress={() => Linking.openURL('https://avide.travel/flights')} />
        <QuickAction icon="🛳️" label="Cruises" onPress={() => Linking.openURL('https://avide.travel/cruises')} />
        <QuickAction icon="🚗" label="Cars" onPress={() => Linking.openURL('https://avide.travel/carrentals')} />
      </View>

      <View style={styles.aiCard}>
        <View style={styles.aiIcon}><Text style={styles.aiIconText}>✨</Text></View>
        <View style={styles.aiCopy}>
          <Text style={styles.aiTitle}>Avide AI Travel Agent</Text>
          <Text style={styles.aiText}>Get destination ideas and vacation-planning help in seconds.</Text>
        </View>
        <Pressable style={styles.aiButton} onPress={() => Linking.openURL('https://avide.travel')}>
          <Text style={styles.aiButtonText}>Ask</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeaderRow}>
        <SectionTitle title="Featured deals" subtitle="Live offers from AvideTravel agents" compact />
        <Pressable onPress={onSeeDeals}><Text style={styles.seeAll}>See all</Text></Pressable>
      </View>

      {loading && !featured.length ? (
        <ActivityIndicator color={colors.blue} style={{ marginVertical: 30 }} />
      ) : error && !featured.length ? (
        <ErrorCard text={error} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
          {featured.map((service) => (
            <DealCard key={service.id} service={service} onPress={() => onOpenDeal(service)} compact />
          ))}
        </ScrollView>
      )}

      <View style={styles.agentCta}>
        <Text style={styles.agentCtaEyebrow}>PERSONAL SERVICE</Text>
        <Text style={styles.agentCtaTitle}>Prefer a real travel agent?</Text>
        <Text style={styles.agentCtaText}>Tell us what you want and an AvideTravel agent can help you plan it.</Text>
        <Pressable style={styles.darkButton} onPress={() => Linking.openURL('https://avide.travel/contact')}>
          <Text style={styles.darkButtonText}>Contact an Agent</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function DealsScreen({ services, loading, error, refreshing, onRefresh, onOpenDeal }: {
  services: Service[];
  loading: boolean;
  error: string;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenDeal: (service: Service) => void;
}) {
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return services;
    const needle = filter.toLowerCase();
    return services.filter((s) => {
      const text = `${s.title ?? ''} ${s.location ?? ''} ${s.category ?? ''}`.toLowerCase();
      if (needle === 'dominican republic') return ['dominican republic', 'punta cana', 'la romana', 'santo domingo'].some((x) => text.includes(x));
      if (needle === 'united states') return ['united states', 'usa', 'hawaii', 'florida', 'orlando', 'miami', 'new york', 'california'].some((x) => text.includes(x));
      if (needle === 'cruise') return ['cruise', 'sailing', 'ship'].some((x) => text.includes(x));
      return text.includes(needle);
    });
  }, [services, filter]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <DealCard service={item} onPress={() => onOpenDeal(item)} />}
        contentContainerStyle={styles.listPad}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <SectionTitle title="Travel deals" subtitle={`${filtered.length} live offer${filtered.length === 1 ? '' : 's'}`} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {filters.map((item) => (
                <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterChip, filter === item && styles.filterChipActive]}>
                  <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {loading && !services.length ? <ActivityIndicator color={colors.blue} style={{ marginVertical: 30 }} /> : null}
            {error && !services.length ? <ErrorCard text={error} /> : null}
          </>
        }
        ListEmptyComponent={!loading ? <EmptyCard title="No deals in this category yet" text="Try another destination or refresh the list." /> : null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function ExploreScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad} showsVerticalScrollIndicator={false}>
      <SectionTitle title="Explore AvideTravel" subtitle="Book and plan every part of your vacation" />
      <View style={styles.exploreGrid}>
        {exploreItems.map((item) => (
          <Pressable key={item.title} style={styles.exploreCard} onPress={() => Linking.openURL(item.url)}>
            <Text style={styles.exploreIcon}>{item.icon}</Text>
            <Text style={styles.exploreTitle}>{item.title}</Text>
            <Text style={styles.exploreSubtitle}>{item.subtitle}</Text>
            <Text style={styles.exploreArrow}>Open →</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function ContactScreen() {
  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open', url);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad} showsVerticalScrollIndicator={false}>
      <SectionTitle title="We’re here to help" subtitle="Talk to AvideTravel directly" />
      <View style={styles.contactHero}>
        <Text style={styles.contactEmoji}>🌎</Text>
        <Text style={styles.contactTitle}>Your next trip starts with a conversation.</Text>
        <Text style={styles.contactText}>Questions about a package, resort, cruise or custom vacation? Reach out and we’ll help.</Text>
      </View>

      <ContactRow icon="📞" title="Call" value="+1 (630) 540-8366" onPress={() => open('tel:+16305408366')} />
      <ContactRow icon="✉️" title="Email" value="avidetravel@gmail.com" onPress={() => open('mailto:avidetravel@gmail.com')} />
      <ContactRow icon="🌐" title="Website" value="avide.travel" onPress={() => open('https://avide.travel')} />
      <ContactRow icon="💬" title="Contact form" value="Send a trip request" onPress={() => open('https://avide.travel/contact')} />

      <Text style={styles.socialHeading}>Follow AvideTravel</Text>
      <View style={styles.socialRow}>
        <SocialButton label="Instagram" onPress={() => open('https://www.instagram.com/avidetravel/')} />
        <SocialButton label="Facebook" onPress={() => open('https://www.facebook.com/people/Avide-Travel/100054402242345/')} />
        <SocialButton label="TikTok" onPress={() => open('https://www.tiktok.com/@avidetravel')} />
      </View>
    </ScrollView>
  );
}

function DealCard({ service, onPress, compact = false }: { service: Service; onPress: () => void; compact?: boolean }) {
  const images = normalizeImages(service.image_url ?? service.images);
  const compare = priceNumber(service.other_agency_price);
  const ours = priceNumber(service.effective_price ?? service.my_price);
  const savings = compare !== null && ours !== null && compare > ours ? compare - ours : null;

  return (
    <Pressable style={[styles.dealCard, compact && styles.dealCardCompact]} onPress={onPress}>
      {images[0] ? (
        <Image source={{ uri: images[0] }} style={styles.dealImage} resizeMode="cover" />
      ) : (
        <View style={[styles.dealImage, styles.imagePlaceholder]}><Text style={styles.placeholderText}>🌴</Text></View>
      )}
      <View style={styles.dealBody}>
        <Text style={styles.locationText} numberOfLines={1}>{service.location || service.category || 'AvideTravel'}</Text>
        <Text style={styles.dealTitle} numberOfLines={2}>{service.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(service)}</Text>
          {savings !== null ? <Text style={styles.save}>Save ${Math.round(savings)}</Text> : null}
        </View>
        <View style={styles.badgeRow}>
          {service.all_inclusive ? <Badge text="All-inclusive" /> : null}
          {service.flight_included ? <Badge text="Flight" /> : null}
          {service.transfer_included ? <Badge text="Transfer" /> : null}
        </View>
      </View>
    </Pressable>
  );
}

function DealModal({ service, agents, onClose }: { service: Service | null; agents: Agent[]; onClose: () => void }) {
  if (!service) return null;
  const images = normalizeImages(service.image_url ?? service.images);
  const agent = agents.find((a) => a.id === service.agent_id);
  const description = service.short_description || service.description || 'Contact an AvideTravel agent for full details and availability.';

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {images[0] ? <Image source={{ uri: images[0] }} style={styles.modalImage} /> : null}
            <View style={styles.modalContent}>
              <View style={styles.modalTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLocation}>{service.location || 'AvideTravel'}</Text>
                  <Text style={styles.modalTitle}>{service.title}</Text>
                </View>
                <Pressable onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable>
              </View>
              <Text style={styles.modalPrice}>{formatPrice(service)}</Text>
              {service.duration ? <Text style={styles.modalMeta}>🗓 {service.duration}</Text> : null}
              <Text style={styles.modalDescription}>{description}</Text>

              <View style={styles.modalBadges}>
                {service.all_inclusive ? <Badge text="All-inclusive" /> : null}
                {service.flight_included ? <Badge text="Flight included" /> : null}
                {service.transfer_included ? <Badge text="Transfer included" /> : null}
                {service.family_friendly ? <Badge text="Family-friendly" /> : null}
                {service.adults_only ? <Badge text="Adults-only" /> : null}
                {service.beach_access ? <Badge text="Beach" /> : null}
              </View>

              {agent ? (
                <View style={styles.agentBox}>
                  <Text style={styles.agentBoxLabel}>YOUR TRAVEL AGENT</Text>
                  <Text style={styles.agentBoxName}>{agent.company_name || agent.name || 'AvideTravel Agent'}</Text>
                  {agent.location ? <Text style={styles.agentBoxMeta}>{agent.location}</Text> : null}
                </View>
              ) : null}

              <Pressable style={styles.primaryFullButton} onPress={() => Linking.openURL(serviceWebUrl(service))}>
                <Text style={styles.primaryFullButtonText}>View Full Deal</Text>
              </Pressable>
              {agent?.phone ? (
                <Pressable style={styles.secondaryFullButton} onPress={() => Linking.openURL(`tel:${agent.phone}`)}>
                  <Text style={styles.secondaryFullButtonText}>Call Agent</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.secondaryFullButton} onPress={() => Linking.openURL(agent?.email ? `mailto:${agent.email}` : 'https://avide.travel/contact')}>
                <Text style={styles.secondaryFullButtonText}>{agent?.email ? 'Email Agent' : 'Contact AvideTravel'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function BottomTabs({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  const tabs: { key: TabKey; icon: string; label: string }[] = [
    { key: 'home', icon: '⌂', label: 'Home' },
    { key: 'deals', icon: '✦', label: 'Deals' },
    { key: 'explore', icon: '⌕', label: 'Explore' },
    { key: 'contact', icon: '☏', label: 'Contact' },
  ];
  return (
    <View style={styles.tabs}>
      {tabs.map((item) => (
        <Pressable key={item.key} style={styles.tab} onPress={() => onChange(item.key)}>
          <Text style={[styles.tabIcon, active === item.key && styles.tabActive]}>{item.icon}</Text>
          <Text style={[styles.tabLabel, active === item.key && styles.tabActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SectionTitle({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }) {
  return (
    <View style={[styles.sectionTitleWrap, compact && { marginBottom: 0 }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function Badge({ text }: { text: string }) {
  return <View style={styles.badge}><Text style={styles.badgeText}>{text}</Text></View>;
}

function ContactRow({ icon, title, value, onPress }: { icon: string; title: string; value: string; onPress: () => void }) {
  return (
    <Pressable style={styles.contactRow} onPress={onPress}>
      <View style={styles.contactIconBox}><Text style={styles.contactIcon}>{icon}</Text></View>
      <View style={{ flex: 1 }}><Text style={styles.contactRowTitle}>{title}</Text><Text style={styles.contactRowValue}>{value}</Text></View>
      <Text style={styles.contactChevron}>›</Text>
    </Pressable>
  );
}

function SocialButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable style={styles.socialButton} onPress={onPress}><Text style={styles.socialButtonText}>{label}</Text></Pressable>;
}

function ErrorCard({ text }: { text: string }) {
  return <View style={styles.errorCard}><Text style={styles.errorTitle}>Could not load live deals</Text><Text style={styles.errorText}>{text}</Text></View>;
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return <View style={styles.emptyCard}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  shell: { flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'android' ? 2 : 0 },
  header: { height: 72, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 },
  logo: { width: 38, height: 38 },
  brand: { fontWeight: '800', fontSize: 17, color: colors.navy, letterSpacing: -0.3 },
  tagline: { fontSize: 10, color: colors.muted, marginTop: 1 },
  helpPill: { backgroundColor: colors.sky, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  helpText: { color: colors.blue, fontSize: 12, fontWeight: '700' },
  content: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.bg },
  screenPad: { padding: 16, paddingBottom: 34 },
  listPad: { padding: 16, paddingBottom: 32 },
  hero: { height: 360, borderRadius: 28, overflow: 'hidden', backgroundColor: colors.navy, marginBottom: 28 },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 21, 43, 0.48)' },
  heroCopy: { flex: 1, justifyContent: 'flex-end', padding: 24 },
  heroEyebrow: { color: '#DCE8FF', fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginBottom: 8 },
  heroTitle: { color: colors.white, fontSize: 31, lineHeight: 35, fontWeight: '900', letterSpacing: -0.9, maxWidth: 310 },
  heroSubtitle: { color: '#F2F5FA', fontSize: 14, lineHeight: 20, marginTop: 10, maxWidth: 300 },
  heroButtons: { flexDirection: 'row', gap: 10, marginTop: 18 },
  primaryButton: { backgroundColor: colors.blue, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 },
  primaryButtonText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  ghostButton: { backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 },
  ghostButtonText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  sectionTitleWrap: { marginBottom: 14 },
  sectionTitle: { fontSize: 23, fontWeight: '900', color: colors.navy, letterSpacing: -0.5 },
  sectionSubtitle: { marginTop: 3, color: colors.muted, fontSize: 13 },
  quickGrid: { flexDirection: 'row', gap: 9, marginBottom: 26 },
  quickAction: { flex: 1, backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: colors.border, paddingVertical: 15, alignItems: 'center' },
  quickIcon: { fontSize: 23, marginBottom: 7 },
  quickLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
  aiCard: { backgroundColor: colors.navy, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  aiIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#173A6A', alignItems: 'center', justifyContent: 'center' },
  aiIconText: { fontSize: 23 },
  aiCopy: { flex: 1, marginHorizontal: 12 },
  aiTitle: { color: colors.white, fontWeight: '800', fontSize: 14 },
  aiText: { color: '#B8C8DD', fontSize: 11, lineHeight: 16, marginTop: 3 },
  aiButton: { backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  aiButtonText: { color: colors.navy, fontWeight: '800', fontSize: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  seeAll: { color: colors.blue, fontWeight: '800', fontSize: 13 },
  horizontalCards: { gap: 12, paddingBottom: 8, paddingRight: 16 },
  dealCard: { backgroundColor: colors.white, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  dealCardCompact: { width: 286, marginBottom: 0 },
  dealImage: { width: '100%', height: 170, backgroundColor: colors.sky },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 38 },
  dealBody: { padding: 15 },
  locationText: { color: colors.blue, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  dealTitle: { color: colors.ink, fontSize: 17, lineHeight: 22, fontWeight: '800', marginTop: 5, minHeight: 44 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  price: { color: colors.green, fontSize: 18, fontWeight: '900' },
  save: { backgroundColor: '#E8F7F0', color: colors.green, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  badge: { backgroundColor: colors.sky, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: '#2356A3', fontSize: 9, fontWeight: '700' },
  agentCta: { backgroundColor: '#EAF2FF', borderRadius: 24, padding: 22, marginTop: 26 },
  agentCtaEyebrow: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  agentCtaTitle: { color: colors.navy, fontSize: 22, fontWeight: '900', marginTop: 7 },
  agentCtaText: { color: colors.muted, lineHeight: 20, marginTop: 8, marginBottom: 17 },
  darkButton: { backgroundColor: colors.navy, alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
  darkButtonText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  filterRow: { gap: 8, paddingBottom: 18 },
  filterChip: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20 },
  filterChipActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  filterText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: colors.white },
  exploreGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  exploreCard: { width: '48%', minHeight: 155, backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 16 },
  exploreIcon: { fontSize: 29 },
  exploreTitle: { color: colors.navy, fontSize: 16, fontWeight: '900', marginTop: 12 },
  exploreSubtitle: { color: colors.muted, fontSize: 11, marginTop: 3, lineHeight: 16 },
  exploreArrow: { color: colors.blue, fontSize: 11, fontWeight: '800', marginTop: 'auto' },
  contactHero: { backgroundColor: colors.navy, borderRadius: 24, padding: 22, marginBottom: 18 },
  contactEmoji: { fontSize: 35 },
  contactTitle: { color: colors.white, fontSize: 23, fontWeight: '900', lineHeight: 28, marginTop: 12 },
  contactText: { color: '#C8D5E6', fontSize: 13, lineHeight: 20, marginTop: 9 },
  contactRow: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  contactIconBox: { width: 42, height: 42, backgroundColor: colors.sky, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  contactIcon: { fontSize: 20 },
  contactRowTitle: { color: colors.navy, fontWeight: '800', fontSize: 13 },
  contactRowValue: { color: colors.muted, fontSize: 12, marginTop: 3 },
  contactChevron: { color: '#A0A8B5', fontSize: 26 },
  socialHeading: { color: colors.navy, fontWeight: '900', fontSize: 17, marginTop: 20, marginBottom: 10 },
  socialRow: { flexDirection: 'row', gap: 8 },
  socialButton: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  socialButtonText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  tabs: { height: 68, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', paddingBottom: Platform.OS === 'ios' ? 5 : 0 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 20, color: '#8D97A7' },
  tabLabel: { fontSize: 10, fontWeight: '700', color: '#8D97A7', marginTop: 3 },
  tabActive: { color: colors.blue },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(4, 14, 30, 0.45)', justifyContent: 'flex-end' },
  modalSheet: { maxHeight: '90%', backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', paddingTop: 8 },
  modalHandle: { width: 40, height: 4, borderRadius: 4, backgroundColor: '#D4D9E1', alignSelf: 'center', marginBottom: 8 },
  modalImage: { width: '100%', height: 230 },
  modalContent: { padding: 20, paddingBottom: 34 },
  modalTopRow: { flexDirection: 'row', gap: 10 },
  modalLocation: { color: colors.blue, textTransform: 'uppercase', fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
  modalTitle: { color: colors.navy, fontSize: 24, fontWeight: '900', lineHeight: 29, marginTop: 5 },
  closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F0F3F7', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.navy, fontSize: 25, lineHeight: 27 },
  modalPrice: { color: colors.green, fontSize: 24, fontWeight: '900', marginTop: 16 },
  modalMeta: { color: colors.muted, fontSize: 12, marginTop: 7 },
  modalDescription: { color: colors.ink, fontSize: 14, lineHeight: 21, marginTop: 16 },
  modalBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 },
  agentBox: { marginTop: 18, backgroundColor: colors.bg, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border },
  agentBoxLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  agentBoxName: { color: colors.navy, fontWeight: '900', fontSize: 15, marginTop: 5 },
  agentBoxMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  primaryFullButton: { backgroundColor: colors.blue, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  primaryFullButtonText: { color: colors.white, fontWeight: '900', fontSize: 14 },
  secondaryFullButton: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 9 },
  secondaryFullButtonText: { color: colors.navy, fontWeight: '800', fontSize: 13 },
  errorCard: { padding: 18, backgroundColor: '#FFF2F2', borderRadius: 16, borderWidth: 1, borderColor: '#FFDADA', marginBottom: 16 },
  errorTitle: { color: colors.red, fontWeight: '900', fontSize: 14 },
  errorText: { color: '#7B4A4A', fontSize: 12, marginTop: 5, lineHeight: 17 },
  emptyCard: { padding: 24, alignItems: 'center', backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: colors.border, marginTop: 12 },
  emptyTitle: { color: colors.navy, fontWeight: '900', fontSize: 15 },
  emptyText: { color: colors.muted, fontSize: 12, marginTop: 6, textAlign: 'center' },
});

export default App;
