const admin = require("firebase-admin");
const https = require("https");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "beatmaster-1111",
    });
}
const db = admin.firestore();

const songs80s = [
    { title: "Billie Jean", artist: "Michael Jackson", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Like a Virgin", artist: "Madonna", year: 1984, genre: "Pop", decade: "1980s" },
    { title: "Take On Me", artist: "a-ha", year: 1985, genre: "Pop", decade: "1980s" },
    { title: "Wake Me Up Before You Go-Go", artist: "Wham!", year: 1984, genre: "Pop", decade: "1980s" },
    { title: "Girls Just Want to Have Fun", artist: "Cyndi Lauper", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Sweet Child O’ Mine", artist: "Guns N’ Roses", year: 1987, genre: "Rock", decade: "1980s" },
    { title: "Livin’ On A Prayer", artist: "Bon Jovi", year: 1986, genre: "Rock", decade: "1980s" },
    { title: "Don’t Stop Believin’", artist: "Journey", year: 1981, genre: "Rock", decade: "1980s" },
    { title: "Every Breath You Take", artist: "The Police", year: 1983, genre: "Rock", decade: "1980s" },
    { title: "Under Pressure", artist: "Queen", year: 1981, genre: "Rock", decade: "1980s" },
    { title: "Eye of the Tiger", artist: "Survivor", year: 1982, genre: "Rock", decade: "1980s" },
    { title: "Tainted Love", artist: "Soft Cell", year: 1981, genre: "Pop", decade: "1980s" },
    { title: "Come On Eileen", artist: "Dexys Midnight Runners", year: 1982, genre: "Pop", decade: "1980s" },
    { title: "Karma Chameleon", artist: "Culture Club", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Purple Rain", artist: "Prince", year: 1984, genre: "Pop", decade: "1980s" },
    { title: "I Wanna Dance with Somebody", artist: "Whitney Houston", year: 1987, genre: "Pop", decade: "1980s" },
    { title: "Never Gonna Give You Up", artist: "Rick Astley", year: 1987, genre: "Pop", decade: "1980s" },
    { title: "Total Eclipse of the Heart", artist: "Bonnie Tyler", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Africa", artist: "Toto", year: 1982, genre: "Pop", decade: "1980s" },
    { title: "Down Under", artist: "Men At Work", year: 1981, genre: "Pop", decade: "1980s" },
    { title: "Don’t You (Forget About Me)", artist: "Simple Minds", year: 1985, genre: "Pop", decade: "1980s" },
    { title: "Relax", artist: "Frankie Goes To Hollywood", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Just Can’t Get Enough", artist: "Depeche Mode", year: 1981, genre: "Pop", decade: "1980s" },
    { title: "Blue Monday", artist: "New Order", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Faith", artist: "George Michael", year: 1987, genre: "Pop", decade: "1980s" },
    { title: "Push It", artist: "Salt-N-Pepa", year: 1987, genre: "Hip-Hop", decade: "1980s" },
    { title: "Sweet Dreams", artist: "Eurythmics", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Walking On Sunshine", artist: "Katrina & The Waves", year: 1985, genre: 'Pop', decade: "1980s" },
    { title: "Hungry Like the Wolf", artist: "Duran Duran", year: 1982, genre: "Pop", decade: "1980s" },
    { title: "Money for Nothing", artist: "Dire Straits", year: 1985, genre: "Rock", decade: "1980s" },
    { title: "Another One Bites the Dust", artist: "Queen", year: 1980, genre: "Rock", decade: "1980s" },
    { title: "Careless Whisper", artist: "George Michael", year: 1984, genre: "Pop", decade: "1980s" },
    { title: "I Still Haven’t Found", artist: "U2", year: 1987, genre: "Rock", decade: "1980s" },
    { title: "Here I Go Again", artist: "Whitesnake", year: 1982, genre: "Rock", decade: "1980s" },
    { title: "You Shook Me All Night Long", artist: "AC/DC", year: 1980, genre: "Rock", decade: "1980s" },
    { title: "Nothing’s Gonna Stop Us Now", artist: "Starship", year: 1987, genre: "Pop", decade: "1980s" },
    { title: "Maneater", artist: "Daryl Hall", year: 1982, genre: "Pop", decade: "1980s" },
    { title: "Ghostbusters", artist: "Ray Parker Jr.", year: 1984, genre: "Pop", decade: "1980s" },
    { title: "Footloose", artist: "Kenny Loggins", year: 1984, genre: "Pop", decade: "1980s" },
    { title: "Thriller", artist: "Michael Jackson", year: 1982, genre: "Pop", decade: "1980s" },
    { title: "Time After Time", artist: "Cyndi Lauper", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Material Girl", artist: "Madonna", year: 1984, genre: "Pop", decade: "1980s" },
    { title: "Super Freak", artist: "Rick James", year: 1981, genre: "R&B / Soul", decade: "1980s" },
    { title: "Somebody to Love", artist: "Queen", year: 1980, genre: "Rock", decade: "1980s" },
    { title: "Call Me", artist: "Blondie", year: 1980, genre: "Rock", decade: "1980s" },
    { title: "Jessie’s Girl", artist: "Rick Springfield", year: 1981, genre: "Pop", decade: "1980s" },
    { title: "Don’t You Want Me", artist: "The Human League", year: 1981, genre: "Pop", decade: "1980s" },
    { title: "True", artist: "Spandau Ballet", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Everybody Wants to Rule", artist: "Tears for Fears", year: 1985, genre: "Pop", decade: "1980s" },
    { title: "I Love Rock N Roll", artist: "Joan Jett", year: 1981, genre: "Rock", decade: "1980s" }
];

const songs90s = [
    { title: "Smells Like Teen Spirit", artist: "Nirvana", year: 1991, genre: "Rock", decade: "1990s" },
    { title: "Wannabe", artist: "Spice Girls", year: 1996, genre: "Pop", decade: "1990s" },
    { title: "...Baby One More Time", artist: "Britney Spears", year: 1998, genre: "Pop", decade: "1990s" },
    { title: "Macarena", artist: "Los Del Rio", year: 1993, genre: "Latin", decade: "1990s" },
    { title: "I Will Always Love You", artist: "Whitney Houston", year: 1992, genre: "Pop", decade: "1990s" },
    { title: "Waterfalls", artist: "TLC", year: 1994, genre: "R&B", decade: "1990s" },
    { title: "Creep", artist: "Radiohead", year: 1992, genre: "Rock", decade: "1990s" },
    { title: "No Diggity", artist: "Blackstreet", year: 1996, genre: "R&B / Soul", decade: "1990s" },
    { title: "Baby Got Back", artist: "Sir Mix-A-Lot", year: 1992, genre: "Hip-Hop", decade: "1990s" },
    { title: "Wonderwall", artist: "Oasis", year: 1995, genre: "Rock", decade: "1990s" },
    { title: "Losing My Religion", artist: "R.E.M.", year: 1991, genre: "Rock", decade: "1990s" },
    { title: "Angels", artist: "Robbie Williams", year: 1997, genre: "Pop", decade: "1990s" },
    { title: "Bitter Sweet Symphony", artist: "The Verve", year: 1997, genre: "Rock", decade: "1990s" },
    { title: "Don’t Speak", artist: "No Doubt", year: 1995, genre: "Rock", decade: "1990s" },
    { title: "Barbie Girl", artist: "Aqua", year: 1997, genre: "Pop", decade: "1990s" },
    { title: "Believe", artist: "Cher", year: 1998, genre: "Pop", decade: "1990s" },
    { title: "Iris", artist: "Goo Goo Dolls", year: 1998, genre: "Rock", decade: "1990s" },
    { title: "Torn", artist: "Natalie Imbruglia", year: 1997, genre: "Pop", decade: "1990s" },
    { title: "I Want It That Way", artist: "Backstreet Boys", year: 1999, genre: "Pop", decade: "1990s" },
    { title: "Vogue", artist: "Madonna", year: 1990, genre: "Pop", decade: "1990s" },
    { title: "Killing Me Softly", artist: "Fugees", year: 1996, genre: "Hip-Hop", decade: "1990s" },
    { title: "Genie in a Bottle", artist: "Christina Aguilera", year: 1999, genre: "Pop", decade: "1990s" },
    { title: "Livin’ la Vida Loca", artist: "Ricky Martin", year: 1999, genre: "Latin", decade: "1990s" },
    { title: "My Heart Will Go On", artist: "Celine Dion", year: 1997, genre: "Pop", decade: "1990s" },
    { title: "Say My Name", artist: "Destiny’s Child", year: 1999, genre: "R&B", decade: "1990s" },
    { title: "U Can’t Touch This", artist: "MC Hammer", year: 1990, genre: "Hip-Hop", decade: "1990s" },
    { title: "Black or White", artist: "Michael Jackson", year: 1991, genre: "Pop", decade: "1990s" },
    { title: "Ice Ice Baby", artist: "Vanilla Ice", year: 1990, genre: "Hip-Hop", decade: "1990s" },
    { title: "Gangsta’s Paradise", artist: "Coolio", year: 1995, genre: "Hip-Hop", decade: "1990s" },
    { title: "Enter Sandman", artist: "Metallica", year: 1991, genre: "Rock", decade: "1990s" },
    { title: "Under the Bridge", artist: "Red Hot Chili Peppers", year: 1991, genre: "Rock", decade: "1990s" },
    { title: "Nothing Compares 2 U", artist: "Sinéad O’Connor", year: 1990, genre: "Pop", decade: "1990s" },
    { title: "What Is Love", artist: "Haddaway", year: 1993, genre: "Pop", decade: "1990s" },
    { title: "Rhythm Is a Dancer", artist: "Snap!", year: 1992, genre: "Pop", decade: "1990s" },
    { title: "Blue (Da Ba Dee)", artist: "Eiffel 65", year: 1998, genre: "Pop", decade: "1990s" },
    { title: "Freestyler", artist: "Bomfunk MC’s", year: 1999, genre: "Electronic", decade: "1990s" },
    { title: "Everybody", artist: "Backstreet Boys", year: 1997, genre: "Pop", decade: "1990s" },
    { title: "Mambo No. 5", artist: "Lou Bega", year: 1999, genre: "Pop", decade: "1990s" },
    { title: "Always Be My Baby", artist: "Mariah Carey", year: 1995, genre: "Pop", decade: "1990s" },
    { title: "Jump Around", artist: "House of Pain", year: 1992, genre: "Hip-Hop", decade: "1990s" },
    { title: "Gettin’ Jiggy Wit It", artist: "Will Smith", year: 1997, genre: "Hip-Hop", decade: "1990s" },
    { title: "The Sign", artist: "Ace of Base", year: 1993, genre: "Pop", decade: "1990s" },
    { title: "Boom Boom Boom Boom", artist: "Vengaboys", year: 1998, genre: "Pop", decade: "1990s" },
    { title: "It’s My Life", artist: "Dr. Alban", year: 1992, genre: "Pop", decade: "1990s" },
    { title: "Coco Jambo", artist: "Mr. President", year: 1996, genre: "Pop", decade: "1990s" },
    { title: "Cotton Eye Joe", artist: "Rednex", year: 1994, genre: "Pop", decade: "1990s" },
    { title: "Scatman", artist: "Scatman John", year: 1994, genre: "Pop", decade: "1990s" },
    { title: "Be My Lover", artist: "La Bouche", year: 1995, genre: "Pop", decade: "1990s" },
    { title: "Two Princes", artist: "Spin Doctors", year: 1991, genre: "Rock", decade: "1990s" },
    { title: "Basket Case", artist: "Green Day", year: 1994, genre: "Rock", decade: "1990s" }
];

const songsHipHop = [
    { title: "Lose Yourself", artist: "Eminem", year: 2002, genre: "Hip-Hop", decade: "2000s" },
    { title: "In Da Club", artist: "50 Cent", year: 2003, genre: "Hip-Hop", decade: "2000s" },
    { title: "HUMBLE.", artist: "Kendrick Lamar", year: 2017, genre: "Hip-Hop", decade: "2010s" },
    { title: "SICKO MODE", artist: "Travis Scott", year: 2018, genre: "Hip-Hop", decade: "2010s" },
    { title: "Juicy", artist: "The Notorious B.I.G.", year: 1994, genre: "Hip-Hop", decade: "1990s" },
    { title: "N.Y. State of Mind", artist: "Nas", year: 1994, genre: "Hip-Hop", decade: "1990s" },
    { title: "C.R.E.A.M.", artist: "Wu-Tang Clan", year: 1993, genre: "Hip-Hop", decade: "1990s" },
    { title: "Straight Outta Compton", artist: "N.W.A", year: 1988, genre: "Hip-Hop", decade: "1980s" },
    { title: "The Next Episode", artist: "Dr. Dre", year: 1999, genre: "Hip-Hop", decade: "1990s" },
    { title: "Still D.R.E.", artist: "Dr. Dre", year: 1999, genre: "Hip-Hop", decade: "1990s" },
    { title: "Gin and Juice", artist: "Snoop Dogg", year: 1993, genre: "Hip-Hop", decade: "1990s" },
    { title: "Big Poppa", artist: "The Notorious B.I.G.", year: 1994, genre: "Hip-Hop", decade: "1990s" },
    { title: "California Love", artist: "2Pac", year: 1995, genre: "Hip-Hop", decade: "1990s" },
    { title: "Changes", artist: "2Pac", year: 1998, genre: "Hip-Hop", decade: "1990s" },
    { title: "Can’t Tell Me Nothing", artist: "Kanye West", year: 2007, genre: "Hip-Hop", decade: "2000s" },
    { title: "Stronger", artist: "Kanye West", year: 2007, genre: "Hip-Hop", decade: "2000s" },
    { title: "Gold Digger", artist: "Kanye West", year: 2005, genre: "Hip-Hop", decade: "2000s" },
    { title: "Ruff Ryders’ Anthem", artist: "DMX", year: 1998, genre: "Hip-Hop", decade: "1990s" },
    { title: "Party Up", artist: "DMX", year: 1999, genre: "Hip-Hop", decade: "1990s" },
    { title: "Ms. Jackson", artist: "Outkast", year: 2000, genre: "Hip-Hop", decade: "2000s" },
    { title: "Hey Ya!", artist: "Outkast", year: 2003, genre: "Hip-Hop", decade: "2000s" },
    { title: "Without Me", artist: "Eminem", year: 2002, genre: "Hip-Hop", decade: "2000s" },
    { title: "The Real Slim Shady", artist: "Eminem", year: 2000, genre: "Hip-Hop", decade: "2000s" },
    { title: "Stan", artist: "Eminem", year: 2000, genre: "Hip-Hop", decade: "2000s" },
    { title: "Drop It Like It’s Hot", artist: "Snoop Dogg", year: 2004, genre: "Hip-Hop", decade: "2000s" },
    { title: "Jesus Walks", artist: "Kanye West", year: 2004, genre: "Hip-Hop", decade: "2000s" },
    { title: "Empire State of Mind", artist: "Jay-Z", year: 2009, genre: "Hip-Hop", decade: "2000s" },
    { title: "Niggas In Paris", artist: "Jay-Z, Kanye West", year: 2011, genre: "Hip-Hop", decade: "2010s" },
    { title: "Swimming Pools", artist: "Kendrick Lamar", year: 2012, genre: "Hip-Hop", decade: "2010s" },
    { title: "Alright", artist: "Kendrick Lamar", year: 2015, genre: "Hip-Hop", decade: "2010s" },
    { title: "God’s Plan", artist: "Drake", year: 2018, genre: "Hip-Hop", decade: "2010s" },
    { title: "Hotline Bling", artist: "Drake", year: 2015, genre: "Hip-Hop", decade: "2010s" },
    { title: "Take Care", artist: "Drake", year: 2011, genre: "Hip-Hop", decade: "2010s" },
    { title: "Bodak Yellow", artist: "Cardi B", year: 2017, genre: "Hip-Hop", decade: "2010s" },
    { title: "Truth Hurts", artist: "Lizzo", year: 2017, genre: "Hip-Hop", decade: "2010s" },
    { title: "Panda", artist: "Desiigner", year: 2015, genre: "Hip-Hop", decade: "2010s" },
    { title: "Bad and Boujee", artist: "Migos", year: 2016, genre: "Hip-Hop", decade: "2010s" },
    { title: "Rockstar", artist: "Post Malone", year: 2017, genre: "Hip-Hop", decade: "2010s" },
    { title: "Lucid Dreams", artist: "Juice WRLD", year: 2018, genre: "Hip-Hop", decade: "2010s" },
    { title: "XO Tour Llif3", artist: "Lil Uzi Vert", year: 2017, genre: "Hip-Hop", decade: "2010s" },
    { title: "Mo Bamba", artist: "Sheck Wes", year: 2017, genre: "Hip-Hop", decade: "2010s" },
    { title: "Highest in the Room", artist: "Travis Scott", year: 2019, genre: "Hip-Hop", decade: "2010s" },
    { title: "Goosebumps", artist: "Travis Scott", year: 2016, genre: "Hip-Hop", decade: "2010s" },
    { title: "M.A.A.D City", artist: "Kendrick Lamar", year: 2012, genre: "Hip-Hop", decade: "2010s" },
    { title: "INDUSTRY BABY", artist: "Lil Nas X", year: 2021, genre: "Hip-Hop", decade: "2020s" },
    { title: "Old Town Road", artist: "Lil Nas X", year: 2019, genre: "Hip-Hop", decade: "2010s" },
    { title: "First Class", artist: "Jack Harlow", year: 2022, genre: "Hip-Hop", decade: "2020s" },
    { title: "WHATS POPPIN", artist: "Jack Harlow", year: 2020, genre: "Hip-Hop", decade: "2020s" },
    { title: "The Box", artist: "Roddy Ricch", year: 2019, genre: "Hip-Hop", decade: "2010s" },
    { title: "Praise The Lord", artist: "A$AP Rocky", year: 2018, genre: "Hip-Hop", decade: "2010s" }
];

const songsDeutsch = [
    { title: "99 Luftballons", artist: "Nena", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Atemlos durch die Nacht", artist: "Helene Fischer", year: 2013, genre: "Schlager", decade: "2010s" },
    { title: "Palmen aus Plastik", artist: "Bonez MC & RAF Camora", year: 2016, genre: "Hip-Hop", decade: "2010s" },
    { title: "Ohne mein Team", artist: "Bonez MC", year: 2016, genre: "Hip-Hop", decade: "2010s" },
    { title: "Was du Liebe nennst", artist: "Bausa", year: 2017, genre: "Hip-Hop", decade: "2010s" },
    { title: "Au Revoir", artist: "Mark Forster", year: 2014, genre: "Pop", decade: "2010s" },
    { title: "Chöre", artist: "Mark Forster", year: 2016, genre: "Pop", decade: "2010s" },
    { title: "Astronaut", artist: "Sido", year: 2015, genre: "Hip-Hop", decade: "2010s" },
    { title: "Bilder im Kopf", artist: "Sido", year: 2012, genre: "Hip-Hop", decade: "2010s" },
    { title: "Tage wie diese", artist: "Die Toten Hosen", year: 2012, genre: "Rock", decade: "2010s" },
    { title: "Major Tom", artist: "Peter Schilling", year: 1982, genre: "Pop", decade: "1980s" },
    { title: "Griechischer Wein", artist: "Udo Jürgens", year: 1974, genre: "Schlager", decade: "1970s" },
    { title: "Männer", artist: "Herbert Grönemeyer", year: 1984, genre: "Pop", decade: "1980s" },
    { title: "Der Weg", artist: "Herbert Grönemeyer", year: 2002, genre: "Pop", decade: "2000s" },
    { title: "Lila Wolken", artist: "Marteria", year: 2012, genre: "Hip-Hop", decade: "2010s" },
    { title: "Roller", artist: "Apache 207", year: 2019, genre: "Hip-Hop", decade: "2010s" },
    { title: "Komet", artist: "Udo Lindenberg, Apache 207", year: 2023, genre: "Pop", decade: "2020s" },
    { title: "Sternenhimmel", artist: "Hubert Kah", year: 1982, genre: "Pop", decade: "1980s" },
    { title: "Skandal im Sperrbezirk", artist: "Spider Murphy Gang", year: 1981, genre: "Rock", decade: "1980s" },
    { title: "Verdammt, ich lieb’ dich", artist: "Matthias Reim", year: 1990, genre: "Schlager", decade: "1990s" },
    { title: "Ein Stern", artist: "DJ Ötzi", year: 2007, genre: "Schlager", decade: "2000s" },
    { title: "Emanuela", artist: "Fettes Brot", year: 2005, genre: "Hip-Hop", decade: "2000s" },
    { title: "Jein", artist: "Fettes Brot", year: 1996, genre: "Hip-Hop", decade: "1990s" },
    { title: "Die Da!?!", artist: "Die Fantastischen Vier", year: 1992, genre: "Hip-Hop", decade: "1990s" },
    { title: "MfG", artist: "Die Fantastischen Vier", year: 1999, genre: "Hip-Hop", decade: "1990s" },
    { title: "Haus am See", artist: "Peter Fox", year: 2008, genre: "Hip-Hop", decade: "2000s" },
    { title: "Alles neu", artist: "Peter Fox", year: 2008, genre: "Hip-Hop", decade: "2000s" },
    { title: "Wind of Change", artist: "Scorpions", year: 1990, genre: "Rock", decade: "1990s" },
    { title: "Altes Fieber", artist: "Die Toten Hosen", year: 2012, genre: "Rock", decade: "2010s" },
    { title: "Schrei", artist: "Tokio Hotel", year: 2005, genre: "Rock", decade: "2000s" },
    { title: "Durch den Monsun", artist: "Tokio Hotel", year: 2005, genre: "Rock", decade: "2000s" },
    { title: "Perfekte Welle", artist: "Juli", year: 2004, genre: "Pop", decade: "2000s" },
    { title: "Geile Zeit", artist: "Juli", year: 2004, genre: "Pop", decade: "2000s" },
    { title: "Symphonie", artist: "Silbermond", year: 2004, genre: "Pop", decade: "2000s" },
    { title: "Dieser Weg", artist: "Xavier Naidoo", year: 2005, genre: "Pop", decade: "2000s" },
    { title: "Augenbling", artist: "Seeed", year: 2012, genre: "Pop", decade: "2010s" },
    { title: "Ding", artist: "Seeed", year: 2005, genre: "Pop", decade: "2000s" },
    { title: "Willst du", artist: "Alligatoah", year: 2013, genre: "Hip-Hop", decade: "2010s" },
    { title: "Bye Bye", artist: "Cro", year: 2015, genre: "Hip-Hop", decade: "2010s" },
    { title: "Easy", artist: "Cro", year: 2011, genre: "Hip-Hop", decade: "2010s" },
    { title: "Vincent", artist: "Sarah Connor", year: 2019, genre: "Pop", decade: "2010s" },
    { title: "Wie schön du bist", artist: "Sarah Connor", year: 2015, genre: "Pop", decade: "2010s" },
    { title: "Wildberry Lillet", artist: "Nina Chuba", year: 2022, genre: "Pop", decade: "2020s" },
    { title: "Mädchen auf dem Pferd", artist: "Luca-Dante", year: 2023, genre: "Electronic", decade: "2020s" },
    { title: "Zukunft Pink", artist: "Peter Fox", year: 2022, genre: "Hip-Hop", decade: "2020s" },
    { title: "Nachts wach", artist: "Miksu", year: 2022, genre: "Hip-Hop", decade: "2020s" },
    { title: "Bauch und Kopf", artist: "Mark Forster", year: 2015, genre: "Pop", decade: "2010s" },
    { title: "Lieblingsmensch", artist: "Namika", year: 2015, genre: "Pop", decade: "2010s" },
    { title: "Ich kenne nichts", artist: "Xavier Naidoo", year: 2003, genre: "Pop", decade: "2000s" },
    { title: "Cello", artist: "Udo Lindenberg", year: 2011, genre: "Pop", decade: "2010s" },
];

const songsRock = [
    { title: "Bohemian Rhapsody", artist: "Queen", year: 1975, genre: "Rock", decade: "1970s" },
    { title: "Eye of the Tiger", artist: "Survivor", year: 1982, genre: "Rock", decade: "1980s" },
    { title: "Sweet Child O’ Mine", artist: "Guns N’ Roses", year: 1987, genre: "Rock", decade: "1980s" },
    { title: "Back In Black", artist: "AC/DC", year: 1980, genre: "Rock", decade: "1980s" },
    { title: "Highway to Hell", artist: "AC/DC", year: 1979, genre: "Rock", decade: "1970s" },
    { title: "Stairway to Heaven", artist: "Led Zeppelin", year: 1971, genre: "Rock", decade: "1970s" },
    { title: "Whole Lotta Love", artist: "Led Zeppelin", year: 1969, genre: "Rock", decade: "1960s" },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", year: 1991, genre: "Rock", decade: "1990s" },
    { title: "Come As You Are", artist: "Nirvana", year: 1992, genre: "Rock", decade: "1990s" },
    { title: "Welcome to the Jungle", artist: "Guns N’ Roses", year: 1987, genre: "Rock", decade: "1980s" },
    { title: "Paradise City", artist: "Guns N’ Roses", year: 1987, genre: "Rock", decade: "1980s" },
    { title: "Livin’ On A Prayer", artist: "Bon Jovi", year: 1986, genre: "Rock", decade: "1980s" },
    { title: "You Give Love A Bad Name", artist: "Bon Jovi", year: 1986, genre: "Rock", decade: "1980s" },
    { title: "Hotel California", artist: "Eagles", year: 1977, genre: "Rock", decade: "1970s" },
    { title: "Paint It, Black", artist: "The Rolling Stones", year: 1966, genre: "Rock", decade: "1960s" },
    { title: "Satisfaction", artist: "The Rolling Stones", year: 1965, genre: "Rock", decade: "1960s" },
    { title: "Start Me Up", artist: "The Rolling Stones", year: 1981, genre: "Rock", decade: "1980s" },
    { title: "Dream On", artist: "Aerosmith", year: 1973, genre: "Rock", decade: "1970s" },
    { title: "Walk This Way", artist: "Aerosmith", year: 1975, genre: "Rock", decade: "1970s" },
    { title: "Another One Bites the Dust", artist: "Queen", year: 1980, genre: "Rock", decade: "1980s" },
    { title: "We Will Rock You", artist: "Queen", year: 1977, genre: "Rock", decade: "1970s" },
    { title: "Don’t Stop Believin’", artist: "Journey", year: 1981, genre: "Rock", decade: "1980s" },
    { title: "Any Way You Want It", artist: "Journey", year: 1980, genre: "Rock", decade: "1980s" },
    { title: "Free Bird", artist: "Lynyrd Skynyrd", year: 1973, genre: "Rock", decade: "1970s" },
    { title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", year: 1974, genre: "Rock", decade: "1970s" },
    { title: "Born to Run", artist: "Bruce Springsteen", year: 1975, genre: "Rock", decade: "1970s" },
    { title: "Dancing in the Dark", artist: "Bruce Springsteen", year: 1984, genre: "Rock", decade: "1980s" },
    { title: "More Than a Feeling", artist: "Boston", year: 1976, genre: "Rock", decade: "1970s" },
    { title: "Under Pressure", artist: "Queen", year: 1981, genre: "Rock", decade: "1980s" },
    { title: "Heroes", artist: "David Bowie", year: 1977, genre: "Rock", decade: "1970s" },
    { title: "Space Oddity", artist: "David Bowie", year: 1969, genre: "Rock", decade: "1960s" },
    { title: "Roxanne", artist: "The Police", year: 1978, genre: "Rock", decade: "1970s" },
    { title: "Every Breath You Take", artist: "The Police", year: 1983, genre: "Rock", decade: "1980s" },
    { title: "Smoke on the Water", artist: "Deep Purple", year: 1973, genre: "Rock", decade: "1970s" },
    { title: "Crazy Train", artist: "Ozzy Osbourne", year: 1980, genre: "Rock", decade: "1980s" },
    { title: "Iron Man", artist: "Black Sabbath", year: 1970, genre: "Rock", decade: "1970s" },
    { title: "Paranoid", artist: "Black Sabbath", year: 1970, genre: "Rock", decade: "1970s" },
    { title: "Tom Sawyer", artist: "Rush", year: 1981, genre: "Rock", decade: "1980s" },
    { title: "Jump", artist: "Van Halen", year: 1984, genre: "Rock", decade: "1980s" },
    { title: "Panama", artist: "Van Halen", year: 1984, genre: "Rock", decade: "1980s" },
    { title: "Runnin’ with the Devil", artist: "Van Halen", year: 1978, genre: "Rock", decade: "1970s" },
    { title: "Sultans of Swing", artist: "Dire Straits", year: 1978, genre: "Rock", decade: "1970s" },
    { title: "Money for Nothing", artist: "Dire Straits", year: 1985, genre: "Rock", decade: "1980s" },
    { title: "The Boys Are Back In Town", artist: "Thin Lizzy", year: 1976, genre: "Rock", decade: "1970s" },
    { title: "Baba O’Riley", artist: "The Who", year: 1971, genre: "Rock", decade: "1970s" },
    { title: "My Generation", artist: "The Who", year: 1965, genre: "Rock", decade: "1960s" },
    { title: "London Calling", artist: "The Clash", year: 1979, genre: "Rock", decade: "1970s" },
    { title: "Should I Stay or Should I Go", artist: "The Clash", year: 1982, genre: "Rock", decade: "1980s" },
    { title: "Light My Fire", artist: "The Doors", year: 1967, genre: "Rock", decade: "1960s" },
    { title: "Riders on the Storm", artist: "The Doors", year: 1971, genre: "Rock", decade: "1970s" }
];

function searchItunes(artist, title) {
    return new Promise((resolve, reject) => {
        const term = encodeURIComponent(`${artist} ${title}`);
        const url = `https://itunes.apple.com/search?term=${term}&country=de&media=music&limit=5`;
        const req = https.get(url, { timeout: 10000 }, res => {
            let data = "";
            res.on("data", c => data += c);
            res.on("end", () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        });
        req.on("error", reject);
        req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function seedCategory(playlistId, songs) {
    console.log("\n=========================================");
    console.log(`Seeding playlist: ${playlistId} (${songs.length} songs)`);
    const existingSnap = await db.collection("songs").where("playlistId", "==", playlistId).get();
    const existing = new Set(existingSnap.docs.map(d => `${d.data().title?.toLowerCase()}|${d.data().artist?.toLowerCase()}`));

    let added = 0, skipped = 0, failed = 0;

    for (const song of songs) {
        const key = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;
        if (existing.has(key)) {
            skipped++;
            console.log(`  ⏭ Übersprungen: ${song.title}`);
            continue;
        }

        console.log(`  🔍 Suche: ${song.title} - ${song.artist}`);
        try {
            const result = await searchItunes(song.artist, song.title);
            const match = result.results?.find(r => r.trackId);

            await db.collection("songs").add({
                title: song.title,
                artist: song.artist,
                year: song.year,
                decade: song.decade,
                genre: song.genre,
                playlistId: playlistId,
                itunesTrackId: match?.trackId || null,
                audioUrl: match?.previewUrl || "",
                appleMusicUrl: match?.trackViewUrl || "",
                coverUrl: match?.artworkUrl100 ? match.artworkUrl100.replace('100x100bb.jpg', '512x512bb.jpg') : null,
                affiliateUrl: null,
                addedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            added++;
            await sleep(2000);
        } catch (e) {
            console.error("  ❌ Fehler:", e.message);
            failed++;
        }
    }

    console.log(`\n✅ FERTIG: ${playlistId} | Hinzugefügt: ${added} | Skipped: ${skipped} | Failed: ${failed}`);
}

async function run() {
    await seedCategory("80s", songs80s);
    await seedCategory("90s", songs90s);
    await seedCategory("hiphop", songsHipHop);
    await seedCategory("deutsch", songsDeutsch);
    await seedCategory("rock", songsRock);

    console.log("\nAlle gesperrten Playlisten wurden erfolgreich mit je 50 Tracks befüllt!");
    process.exit(0);
}

run();
