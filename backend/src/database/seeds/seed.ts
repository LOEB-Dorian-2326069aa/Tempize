import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { entities } from '../entities';
import { User } from '../../modules/users/entities/user.entity';
import { Tag } from '../../modules/tags/entities/tag.entity';
import { Event } from '../../modules/events/entities/event.entity';
import { Participation } from '../../modules/participations/entities/participation.entity';
import { Swipe } from '../../modules/swipes/entities/swipe.entity';
import { Announcement } from '../../modules/announcements/entities/announcement.entity';
import { AvisEvenement } from '../../modules/reviews/entities/avis-evenement.entity';
import { AvisOrganisateur } from '../../modules/reviews/entities/avis-organisateur.entity';
import { StatutEvenement, StatutParticipation, TypeAcces, DirectionSwipe } from '../../common/enums';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
  username: process.env.POSTGRES_USER || 'tempize',
  password: process.env.POSTGRES_PASSWORD || 'tempize_secret',
  database: process.env.POSTGRES_DB || 'tempize_db',
  entities,
  synchronize: true,
  logging: false,
});

async function runSeed() {
  console.log('Initialisation du Seed Tempize...');
  await AppDataSource.initialize();
  console.log('✓ Connecté à PostgreSQL.');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  // 1. Nettoyage des anciennes données
  console.log('Nettoyage des tables existantes...');
  try {
    await queryRunner.query(
      `TRUNCATE TABLE avis_organisateur, avis_evenement, annonce, participation, swipe, evenement_tag, utilisateur_tag, evenement, utilisateur, tag RESTART IDENTITY CASCADE;`
    );
  } catch (e) {
    console.warn('Note sur le nettoyage :', e.message);
  }

  // 2. Insertion des Tags
  console.log('Création des tags de centres d\'intérêt...');
  const tagRepo = AppDataSource.getRepository(Tag);
  const tagLabels = [
    'Plein air',
    'Jeux de société',
    'Culture',
    'Musique',
    'Bar',
    'Sport',
    'Randonnée',
    'Cuisine',
    'Soirée',
    'Jeux vidéo',
    'Cinéma',
    'Voyage',
    'Art & Photo',
    'Café & Papote',
  ];

  const savedTags: Tag[] = [];
  for (const libelle of tagLabels) {
    const t = tagRepo.create({ libelle });
    savedTags.push(await tagRepo.save(t));
  }
  const tagMap = new Map(savedTags.map((t) => [t.libelle, t]));

  // 3. Insertion des Utilisateurs
  console.log('Création des utilisateurs...');
  const userRepo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const rawUsers = [
    {
      pseudo: 'lucas_m',
      email: 'lucas@tempize.dev',
      bio: 'Passionné de jeux de société, sorties culturelles et running en bord de Seine 🏃‍♂️',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1998-05-14'),
      latitude: 48.8712,
      longitude: 2.3654,
      est_premium: true,
      tags: ['Jeux de société', 'Sport', 'Bar', 'Culture'],
    },
    {
      pseudo: 'lea_martin',
      email: 'lea@tempize.dev',
      bio: 'Amoureuse des piques-niques au canal, des friperies et des apéros sans chichi 🥪✨',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1999-09-22'),
      latitude: 48.8725,
      longitude: 2.3661,
      est_premium: false,
      tags: ['Plein air', 'Café & Papote', 'Cuisine', 'Musique'],
    },
    {
      pseudo: 'thomas_d',
      email: 'thomas@tempize.dev',
      bio: 'Toujours partant pour une rando, un burger ou un concert indie rock 🎸',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1996-03-10'),
      latitude: 48.8534,
      longitude: 2.3789,
      est_premium: false,
      tags: ['Musique', 'Randonnée', 'Bar'],
    },
    {
      pseudo: 'camille_l',
      email: 'camille@tempize.dev',
      bio: 'Adepte des musées le dimanche et des sessions de bloc en semaine 🧗‍♀️',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('2000-11-04'),
      latitude: 48.8856,
      longitude: 2.3412,
      est_premium: true,
      tags: ['Sport', 'Culture', 'Art & Photo'],
    },
    {
      pseudo: 'alexandre_p',
      email: 'alexandre@tempize.dev',
      bio: 'Guitariste du dimanche, joueur de Catan et amateur de microbrasseries 🎲🍻',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1995-07-18'),
      latitude: 48.8643,
      longitude: 2.3789,
      est_premium: false,
      tags: ['Jeux de société', 'Musique', 'Bar'],
    },
    {
      pseudo: 'sarah_m',
      email: 'sarah@tempize.dev',
      bio: 'Graphiste freelance. Café glacé, expositions contemporaines et balades urbaines.',
      photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1997-01-29'),
      latitude: 48.8601,
      longitude: 2.3524,
      est_premium: false,
      tags: ['Art & Photo', 'Culture', 'Café & Papote'],
    },
    {
      pseudo: 'hugo_s',
      email: 'hugo@tempize.dev',
      bio: 'Fan de street food, cinéma d\'auteur et parties de Mario Kart endiablées 🏎️',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('2001-08-15'),
      latitude: 48.8912,
      longitude: 2.3871,
      est_premium: false,
      tags: ['Jeux vidéo', 'Cinéma', 'Cuisine'],
    },
    {
      pseudo: 'chloe_b',
      email: 'chloe@tempize.dev',
      bio: 'Yoga matinal, podcasts voyage et ateliers poterie. Viens comme tu es !',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1999-04-12'),
      latitude: 48.8412,
      longitude: 2.3514,
      est_premium: false,
      tags: ['Voyage', 'Plein air', 'Café & Papote'],
    },
    {
      pseudo: 'maxime_g',
      email: 'maxime@tempize.dev',
      bio: 'Développeur curieux. J\'adore cuisiner pour 10 et tester des nouveaux restos asiatiques 🍜',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1994-12-03'),
      latitude: 48.8687,
      longitude: 2.3812,
      est_premium: false,
      tags: ['Cuisine', 'Soirée', 'Jeux de société'],
    },
    {
      pseudo: 'emma_r',
      email: 'emma@tempize.dev',
      bio: 'Nouvelle sur Paris ! En quête de gens sympas pour découvrir la ville et papoter 🥐',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('2002-02-19'),
      latitude: 48.8541,
      longitude: 2.3614,
      est_premium: false,
      tags: ['Café & Papote', 'Plein air', 'Culture'],
    },
    {
      pseudo: 'nathan_k',
      email: 'nathan@tempize.dev',
      bio: 'Course à pied, semi-marathons et bières de récup. Zéro pression, juste du plaisir.',
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1997-06-25'),
      latitude: 48.8891,
      longitude: 2.3923,
      est_premium: true,
      tags: ['Sport', 'Plein air', 'Bar'],
    },
    {
      pseudo: 'manon_f',
      email: 'manon@tempize.dev',
      bio: 'Passionnée de photo argentique et de concerts intimistes dans les petits rades parisiens.',
      photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1998-10-31'),
      latitude: 48.8654,
      longitude: 2.3845,
      est_premium: false,
      tags: ['Art & Photo', 'Musique', 'Soirée'],
    },
    {
      pseudo: 'julien_v',
      email: 'julien@tempize.dev',
      bio: 'Pétanque aux Arènes de Lutèce, vins naturels et débats passionnés sur le cinéma.',
      photo: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1993-09-08'),
      latitude: 48.8456,
      longitude: 2.3523,
      est_premium: false,
      tags: ['Plein air', 'Cinéma', 'Bar'],
    },
    {
      pseudo: 'ines_t',
      email: 'ines@tempize.dev',
      bio: 'Club de lecture et thé matcha. J\'aime les conversations profondes et les rires francs.',
      photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('2000-07-14'),
      latitude: 48.8512,
      longitude: 2.3456,
      est_premium: false,
      tags: ['Café & Papote', 'Culture', 'Voyage'],
    },
    {
      pseudo: 'arthur_b',
      email: 'arthur@tempize.dev',
      bio: 'Toujours partant pour tester une nouvelle adresse street food ou un escape game.',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      date_naissance: new Date('1996-05-20'),
      latitude: 48.8612,
      longitude: 2.3689,
      est_premium: false,
      tags: ['Cuisine', 'Jeux de société', 'Soirée'],
    },
  ];

  const savedUsers: User[] = [];
  for (const ru of rawUsers) {
    const userTags = ru.tags.map((tName) => tagMap.get(tName)).filter((t): t is Tag => !!t);
    const u = userRepo.create({
      pseudo: ru.pseudo,
      email: ru.email,
      mot_de_passe: passwordHash,
      bio: ru.bio,
      photo: ru.photo,
      date_naissance: ru.date_naissance,
      latitude: ru.latitude,
      longitude: ru.longitude,
      est_premium: ru.est_premium,
      location: {
        type: 'Point',
        coordinates: [ru.longitude, ru.latitude],
      },
      tags: userTags,
    });
    savedUsers.push(await userRepo.save(u));
  }
  const userMap = new Map(savedUsers.map((u) => [u.pseudo, u]));

  // 4. Insertion des Événements
  console.log('Création des événements...');
  const eventRepo = AppDataSource.getRepository(Event);

  const now = new Date();
  const getFutureDate = (daysAhead: number, hours: number, minutes = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const rawEvents = [
    {
      titre: 'Pique-nique au canal',
      description: 'Une nappe, quelques trucs à grignoter et des gens à découvrir. Viens comme tu es, même en solo ! Apporte une boisson ou un petit truc à partager.',
      adresse: 'Canal Saint-Martin, Quai de Jemmapes, Paris 10e',
      latitude: 48.8725,
      longitude: 2.3661,
      date_debut: getFutureDate(1, 18, 30),
      date_fin: getFutureDate(1, 22, 0),
      organisateur: userMap.get('lea_martin')!,
      nb_places_max: 12,
      type_acces: TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      tags: ['Plein air', 'Café & Papote', 'Cuisine'],
    },
    {
      titre: 'Café & nouvelles têtes',
      description: 'Prendre un café en terrasse et papoter de tout et de rien. Idéal pour faire connaissance tranquillement en petit comité.',
      adresse: 'Café des Arts, 14 Rue de la Roquette, Paris 11e',
      latitude: 48.8542,
      longitude: 2.3712,
      date_debut: getFutureDate(2, 10, 30),
      date_fin: getFutureDate(2, 12, 30),
      organisateur: userMap.get('lucas_m')!,
      nb_places_max: 8,
      type_acces: TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      tags: ['Café & Papote', 'Culture'],
    },
    {
      titre: 'Session Running Parc de la Villette',
      description: 'Footing tranquille de 6-8 km à allure adaptable (environ 5:45/km). Étirements ensemble et verre pour ceux qui veulent après !',
      adresse: 'Parc de la Villette, 211 Avenue Jean Jaurès, Paris 19e',
      latitude: 48.8924,
      longitude: 2.3891,
      date_debut: getFutureDate(3, 10, 0),
      date_fin: getFutureDate(3, 11, 30),
      organisateur: userMap.get('nathan_k')!,
      nb_places_max: 15,
      type_acces: TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      tags: ['Sport', 'Plein air'],
    },
    {
      titre: 'Soirée Jeux de Société & Bières artisanales',
      description: 'Catan, Dixit, CodeNames ou 7 Wonders ! Jeux fournis sur place, débutants très bienvenus, ambiance détendue.',
      adresse: 'Le Nid - Cocon Ludique, 227 Rue Saint-Martin, Paris 3e',
      latitude: 48.8654,
      longitude: 2.3551,
      date_debut: getFutureDate(2, 19, 30),
      date_fin: getFutureDate(2, 23, 0),
      organisateur: userMap.get('alexandre_p')!,
      nb_places_max: 10,
      type_acces: TypeAcces.SUR_VALIDATION,
      statut: StatutEvenement.ACTIF,
      tags: ['Jeux de société', 'Bar', 'Soirée'],
    },
    {
      titre: 'Balade Street Art & Photo à Belleville',
      description: 'Parcours découverte des plus belles fresques de Belleville et Ménilmontant avec pause panorama au parc.',
      adresse: 'Métro Belleville, Paris 20e',
      latitude: 48.8722,
      longitude: 2.3775,
      date_debut: getFutureDate(4, 14, 30),
      date_fin: getFutureDate(4, 17, 0),
      organisateur: userMap.get('sarah_m')!,
      nb_places_max: 8,
      type_acces: TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      tags: ['Art & Photo', 'Plein air', 'Culture'],
    },
    {
      titre: 'Afterwork rooftop & musique acoustique',
      description: 'Coucher de soleil, vue imprenable sur Paris et live acoustique guitare/voix en terrasse.',
      adresse: 'Le Perchoir Ménilmontant, 14 Rue Crespin du Gast, Paris 11e',
      latitude: 48.8643,
      longitude: 2.3821,
      date_debut: getFutureDate(1, 19, 0),
      date_fin: getFutureDate(1, 23, 30),
      organisateur: userMap.get('manon_f')!,
      nb_places_max: 14,
      type_acces: TypeAcces.SUR_VALIDATION,
      statut: StatutEvenement.ACTIF,
      tags: ['Musique', 'Bar', 'Soirée'],
    },
    {
      titre: 'Session Escalade de Bloc en solo bienvenus',
      description: 'Grimpe tous niveaux, entraide et conseils pour les voies de bloc, suivi d\'un verre à l\'espace lounge.',
      adresse: 'Climbing District Batignolles, 69 Rue Rostropovitch, Paris 17e',
      latitude: 48.8912,
      longitude: 2.3142,
      date_debut: getFutureDate(5, 18, 30),
      date_fin: getFutureDate(5, 21, 0),
      organisateur: userMap.get('camille_l')!,
      nb_places_max: 8,
      type_acces: TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      tags: ['Sport'],
    },
    {
      titre: 'Tournoi amical de pétanque & apéro',
      description: 'Doublettes tirées au sort, boules disponibles si tu n\'en as pas. Apéro partagé au soleil dans un cadre historique !',
      adresse: 'Arènes de Lutèce, 49 Rue Monge, Paris 5e',
      latitude: 48.8456,
      longitude: 2.3523,
      date_debut: getFutureDate(2, 17, 0),
      date_fin: getFutureDate(2, 20, 30),
      organisateur: userMap.get('julien_v')!,
      nb_places_max: 16,
      type_acces: TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      tags: ['Plein air', 'Bar', 'Sport'],
    },
    {
      titre: 'Brunch dominical & papote voyage',
      description: 'Pancakes, café filtre et récits de voyages. Chacun apporte ses anecdotes et ses envies d\'évasion.',
      adresse: 'Holybelly 5, 5 Rue Lucien Sampaix, Paris 10e',
      latitude: 48.8711,
      longitude: 2.3592,
      date_debut: getFutureDate(3, 11, 30),
      date_fin: getFutureDate(3, 13, 30),
      organisateur: userMap.get('chloe_b')!,
      nb_places_max: 6,
      type_acces: TypeAcces.SUR_VALIDATION,
      statut: StatutEvenement.ACTIF,
      tags: ['Cuisine', 'Voyage', 'Café & Papote'],
    },
    {
      titre: 'Ciné-débat & verre après séance',
      description: 'Projection d\'un film en VO suivie d\'un échange décontracté autour d\'un verre au bord du bassin.',
      adresse: 'MK2 Quai de Seine, 14 Quai de la Seine, Paris 19e',
      latitude: 48.8834,
      longitude: 2.3712,
      date_debut: getFutureDate(4, 19, 45),
      date_fin: getFutureDate(4, 23, 0),
      organisateur: userMap.get('hugo_s')!,
      nb_places_max: 10,
      type_acces: TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      tags: ['Cinéma', 'Culture', 'Bar'],
    },
    {
      titre: 'Atelier cuisine partagée : Gyoza maison',
      description: 'Préparation collective de gyoza japonais de A à Z (farce, pliage, cuisson), puis dégustation tous ensemble !',
      adresse: 'La Recyclerie, 83 Boulevard Ornano, Paris 18e',
      latitude: 48.8987,
      longitude: 2.3445,
      date_debut: getFutureDate(6, 17, 30),
      date_fin: getFutureDate(6, 21, 0),
      organisateur: userMap.get('maxime_g')!,
      nb_places_max: 8,
      type_acces: TypeAcces.SUR_VALIDATION,
      statut: StatutEvenement.ACTIF,
      tags: ['Cuisine', 'Café & Papote'],
    },
    {
      titre: 'Soirée Mario Kart & Smash Bros au bar gaming',
      description: 'Manettes prêtes pour des tournois amicaux sans prise de tête. Cocktails à thème et bonne humeur garantie.',
      adresse: 'Reset Bar, 17 Rue du Cygne, Paris 1er',
      latitude: 48.8623,
      longitude: 2.3501,
      date_debut: getFutureDate(5, 20, 0),
      date_fin: getFutureDate(5, 23, 30),
      organisateur: userMap.get('arthur_b')!,
      nb_places_max: 12,
      type_acces: TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      tags: ['Jeux vidéo', 'Bar', 'Soirée'],
    },
    {
      titre: 'Randonnée en forêt de Fontainebleau',
      description: 'Boucle des 25 bosses (version accessible 12 km), pique-nique au sommet des rochers et retour en Transilien.',
      adresse: 'Gare de Lyon (Point de rdv Hall 1), Paris 12e',
      latitude: 48.8443,
      longitude: 2.3734,
      date_debut: getFutureDate(7, 9, 0),
      date_fin: getFutureDate(7, 17, 30),
      organisateur: userMap.get('thomas_d')!,
      nb_places_max: 10,
      type_acces: TypeAcces.SUR_VALIDATION,
      statut: StatutEvenement.ACTIF,
      tags: ['Randonnée', 'Plein air', 'Sport'],
    },
    {
      titre: 'Jam session acoustique guitare & chant',
      description: 'Amène ta guitare, ton ukulélé ou juste ta voix ! Répertoire pop, folk et soul au bord de l\'eau.',
      adresse: 'Bassin de la Villette, Quai de la Loire, Paris 19e',
      latitude: 48.8845,
      longitude: 2.3734,
      date_debut: getFutureDate(3, 16, 0),
      date_fin: getFutureDate(3, 19, 0),
      organisateur: userMap.get('alexandre_p')!,
      nb_places_max: 15,
      type_acces: TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      tags: ['Musique', 'Plein air'],
    },
    {
      titre: 'Découverte expo contemporaine & goûter',
      description: 'Visite de l\'exposition temporaire au Palais de Tokyo, suivie d\'un goûter debrief au café du musée.',
      adresse: 'Palais de Tokyo, 13 Avenue du Président Wilson, Paris 16e',
      latitude: 48.8645,
      longitude: 2.2967,
      date_debut: getFutureDate(4, 15, 0),
      date_fin: getFutureDate(4, 18, 0),
      organisateur: userMap.get('ines_t')!,
      nb_places_max: 8,
      type_acces: TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      tags: ['Culture', 'Art & Photo', 'Café & Papote'],
    },
  ];

  const savedEvents: Event[] = [];
  for (const re of rawEvents) {
    const eventTags = re.tags.map((tName) => tagMap.get(tName)).filter((t): t is Tag => !!t);
    const ev = eventRepo.create({
      titre: re.titre,
      description: re.description,
      adresse: re.adresse,
      latitude: re.latitude,
      longitude: re.longitude,
      date_debut: re.date_debut,
      date_fin: re.date_fin,
      id_organisateur: re.organisateur.id_utilisateur,
      organisateur: re.organisateur,
      nb_places_max: re.nb_places_max,
      type_acces: re.type_acces,
      statut: re.statut,
      location: {
        type: 'Point',
        coordinates: [re.longitude, re.latitude],
      },
      tags: eventTags,
    });
    savedEvents.push(await eventRepo.save(ev));
  }

  // 5. Insertion des Participations
  console.log('Enregistrement des participations...');
  const partRepo = AppDataSource.getRepository(Participation);

  // Pour "Pique-nique au canal" (événement 0) : 8 inscrits pour 4 places libres (total 12)
  const canalEvent = savedEvents[0];
  const participantsPiqueNique = [
    'lucas_m',
    'thomas_d',
    'camille_l',
    'alexandre_p',
    'sarah_m',
    'hugo_s',
    'chloe_b',
    'maxime_g',
  ];

  for (const pseudo of participantsPiqueNique) {
    const user = userMap.get(pseudo);
    if (user && user.id_utilisateur !== canalEvent.id_organisateur) {
      await partRepo.save(
        partRepo.create({
          id_utilisateur: user.id_utilisateur,
          id_evenement: canalEvent.id_evenement,
          statut_participation: StatutParticipation.ACCEPTE,
          date_demande: new Date(),
        })
      );
    }
  }

  // Distribuer des participations réalistes sur les autres événements
  for (let i = 1; i < savedEvents.length; i++) {
    const ev = savedEvents[i];
    const candidateUsers = savedUsers.filter((u) => u.id_utilisateur !== ev.id_organisateur);
    // Prendre entre 2 et 7 participants au hasard
    const nbPart = Math.min(candidateUsers.length, Math.floor(Math.random() * 5) + 3);
    const selectedUsers = candidateUsers.slice(0, nbPart);

    for (const u of selectedUsers) {
      await partRepo.save(
        partRepo.create({
          id_utilisateur: u.id_utilisateur,
          id_evenement: ev.id_evenement,
          statut_participation: Math.random() > 0.2 ? StatutParticipation.ACCEPTE : StatutParticipation.EN_ATTENTE,
          date_demande: new Date(),
        })
      );
    }
  }

  // 6. Insertion des Swipes
  console.log('Simulation des swipes utilisateurs...');
  const swipeRepo = AppDataSource.getRepository(Swipe);
  // Lucas a swipé quelques événements
  const lucas = userMap.get('lucas_m')!;
  if (lucas) {
    for (let i = 2; i <= 5; i++) {
      if (savedEvents[i]) {
        await swipeRepo.save(
          swipeRepo.create({
            id_utilisateur: lucas.id_utilisateur,
            id_evenement: savedEvents[i].id_evenement,
            direction: i % 2 === 0 ? DirectionSwipe.DROITE : DirectionSwipe.GAUCHE,
          })
        );
      }
    }
  }

  // 7. Annonces organisateur
  console.log('Création des annonces sur les événements...');
  const annRepo = AppDataSource.getRepository(Announcement);
  await annRepo.save(
    annRepo.create({
      id_evenement: canalEvent.id_evenement,
      id_organisateur: canalEvent.id_organisateur,
      contenu: 'Coucou tout le monde ! On s\'installe près de la passerelle rouge. J\'apporte un grand plaid jaune et une enceinte !',
      date_publication: new Date(),
    })
  );

  const cafeEvent = savedEvents[1];
  await annRepo.save(
    annRepo.create({
      id_evenement: cafeEvent.id_evenement,
      id_organisateur: cafeEvent.id_organisateur,
      contenu: 'Je serai à la table en terrasse avec un pull vert et un carnet noir. N\'hésitez pas à vous asseoir en arrivant.',
      date_publication: new Date(),
    })
  );

  // 8. Avis organisateurs & événements
  console.log('Ajout d\'avis et notes...');
  const avisOrgRepo = AppDataSource.getRepository(AvisOrganisateur);
  await avisOrgRepo.save(
    avisOrgRepo.create({
      id_auteur: userMap.get('lucas_m')!.id_utilisateur,
      id_organisateur: userMap.get('lea_martin')!.id_utilisateur,
      note_organisateur: 5,
      commentaire: 'Super organisatrice ! Ambiance très chaleureuse et inclusive, on se sent tout de suite à l\'aise.',
    })
  );
  await avisOrgRepo.save(
    avisOrgRepo.create({
      id_auteur: userMap.get('thomas_d')!.id_utilisateur,
      id_organisateur: userMap.get('lea_martin')!.id_utilisateur,
      note_organisateur: 5,
      commentaire: 'Léa met tout le monde à l\'aise dès les premières secondes. Hâte du prochain pique-nique !',
    })
  );

  await queryRunner.release();
  await AppDataSource.destroy();

  console.log('\n======================================================');
  console.log('SEED TEMPIZE TERMINÉ AVEC SUCCÈS !');
  console.log(`✓ ${savedTags.length} tags créés`);
  console.log(`✓ ${savedUsers.length} utilisateurs créés (mot de passe : "Password123!")`);
  console.log(`✓ ${savedEvents.length} événements géolocalisés à Paris`);
  console.log('✓ Participations, swipes, annonces et avis générés');
  console.log('======================================================\n');
}

runSeed().catch((err) => {
  console.error('Erreur lors du seed :', err);
  process.exit(1);
});
