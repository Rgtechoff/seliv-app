import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Conditions d\'utilisation' };

export default function TermsPage() {
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
            <h1 className="text-3xl font-black text-foreground mb-2">Conditions d&apos;utilisation</h1>
            <p className="text-sm text-foreground-secondary">Dernière mise à jour : mars 2026</p>
          </div>

          {[
            {
              title: '1. Acceptation des conditions',
              content: 'En accédant à la plateforme SELIV, vous acceptez d\'être lié par ces conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser notre service.',
            },
            {
              title: '2. Description du service',
              content: 'SELIV est une plateforme de mise en relation entre clients souhaitant des sessions de live selling et des vendeurs professionnels qualifiés sur des plateformes telles que Whatnot, TikTok Shop et Instagram.',
            },
            {
              title: '3. Inscription et compte',
              content: 'Pour utiliser SELIV, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les activités effectuées via votre compte.',
            },
            {
              title: '4. Utilisation acceptable',
              content: 'Vous vous engagez à utiliser SELIV conformément aux lois applicables et à ne pas utiliser le service à des fins illicites, frauduleuses ou préjudiciables à autrui. Tout contenu inapproprié ou comportement abusif entraînera la suspension du compte.',
            },
            {
              title: '5. Paiements et remboursements',
              content: 'Les paiements sont traités de manière sécurisée via Stripe. Notre politique d\'annulation prévoit un remboursement à 100 % si l\'annulation intervient plus de 48h avant le live, et à 50 % dans les 48h précédant le live. Aucun remboursement n\'est possible une fois le live commencé.',
            },
            {
              title: '6. Propriété intellectuelle',
              content: 'Tout le contenu de la plateforme SELIV (logos, textes, images, code) est protégé par le droit d\'auteur et appartient à SELIV ou à ses partenaires. Toute reproduction sans autorisation est interdite.',
            },
            {
              title: '7. Limitation de responsabilité',
              content: 'SELIV agit en tant qu\'intermédiaire entre clients et vendeurs. Nous ne pouvons être tenus responsables des actes ou omissions des vendeurs lors des sessions. Notre responsabilité est limitée au montant payé pour la mission concernée.',
            },
            {
              title: '8. Modifications',
              content: 'SELIV se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements significatifs. La poursuite de l\'utilisation du service après notification vaut acceptation des nouvelles conditions.',
            },
            {
              title: '9. Contact',
              content: 'Pour toute question relative à ces conditions, contactez-nous à : legal@seliv.fr',
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
