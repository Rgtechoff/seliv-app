import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Politique de confidentialité' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">Politique de confidentialité</h1>
            <p className="text-sm text-foreground-secondary">Dernière mise à jour : mars 2026</p>
          </div>

          {[
            {
              title: '1. Données collectées',
              content: 'SELIV collecte les données que vous nous fournissez directement (nom, email, téléphone, informations de paiement) ainsi que des données techniques (adresse IP, type de navigateur, pages visitées) pour améliorer notre service.',
            },
            {
              title: '2. Utilisation des données',
              content: 'Vos données sont utilisées pour : gérer votre compte et vos missions, traiter les paiements via Stripe, vous envoyer des notifications liées à vos missions, améliorer nos services, et respecter nos obligations légales.',
            },
            {
              title: '3. Partage des données',
              content: 'Nous ne vendons jamais vos données personnelles. Nous les partageons uniquement avec nos prestataires de services (Stripe pour les paiements, Resend pour les emails) dans le cadre strict de la fourniture de nos services. Les coordonnées des clients ne sont jamais communiquées aux vendeurs.',
            },
            {
              title: '4. Cookies',
              content: 'SELIV utilise des cookies essentiels au fonctionnement du service (authentification, préférences). Nous n\'utilisons pas de cookies publicitaires tiers. Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités pourraient être affectées.',
            },
            {
              title: '5. Conservation des données',
              content: 'Vos données sont conservées pendant la durée de votre relation avec SELIV, puis archivées pendant 3 ans pour répondre à nos obligations légales. Vous pouvez demander la suppression de votre compte à tout moment.',
            },
            {
              title: '6. Vos droits (RGPD)',
              content: 'Conformément au RGPD, vous disposez des droits d\'accès, de rectification, d\'effacement, de portabilité et d\'opposition concernant vos données personnelles. Pour exercer ces droits, contactez-nous à : privacy@seliv.fr',
            },
            {
              title: '7. Sécurité',
              content: 'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation. Les données de paiement sont traitées directement par Stripe et ne sont jamais stockées sur nos serveurs.',
            },
            {
              title: '8. Contact',
              content: 'Pour toute question relative à la protection de vos données personnelles, contactez notre délégué à la protection des données : privacy@seliv.fr — SELIV SAS, France.',
            },
          ].map(({ title, content }) => (
            <div key={title} className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
