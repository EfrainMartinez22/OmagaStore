const {
    Client,
    GatewayIntentBits,
    Events,
    REST,
    Routes,
    SlashCommandBuilder,
    Partials,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    InteractionType,
} = require('discord.js');

require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

const patronesProhibidos = [
    /c[\W_]*h[\W_]*e[\W_]*a[\W_]*t/gi,
    /m[\W_]*o[\W_]*d[\W_]*[\W_]*m[\W_]*e[\W_]*n[\W_]*u/gi,
    /h[\W_]*a[\W_]*c[\W_]*k/gi,
];

client.once(Events.ClientReady, async () => {
    console.log(`✅ Bot iniciado como ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
            {
                body: [
                    new SlashCommandBuilder()
                        .setName('pago')
                        .setDescription('Muestra los métodos de pago disponibles.')
                        .toJSON(),
                ],
            }
        );

        console.log('✅ Comando /pago registrado correctamente.');
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const contenido = message.content.toLowerCase();
    const contieneProhibidas = patronesProhibidos.some((patron) => patron.test(contenido));

    if (contieneProhibidas) {
        try {
            await message.delete();
            await message.channel.send({
                content: '⚠️ Favor no usar esas palabras. Mejor utiliza **cheto** o **swoofer**.',
            });
        } catch (error) {
            console.error('❌ Error al eliminar mensaje:', error);
        }
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.type === InteractionType.ApplicationCommand && interaction.commandName === 'pago') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Paypal')
                .setStyle(ButtonStyle.Link)
                .setURL('https://www.paypal.com/'), // Cambia por tu enlace de pago real
            new ButtonBuilder()
                .setCustomId('mercado_pago')
                .setLabel('Mercado Libre')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('transferencia')
                .setLabel('Transferencia Bancaria')
                .setStyle(ButtonStyle.Secondary),
        );

        await interaction.reply({
            content: '**Contamos con los siguientes métodos de pago:**',
            components: [row],
        });
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'mercado_pago') {
            await interaction.reply({
                ephemeral: true,
                content:
                    '🛒 *Método de pago - Mercado Libre*\nPuedes realizar el pago a través de esta liga:\nhttps://www.mercadolibre.com.mx/miscompras (o reemplaza por la tuya)',
            });
        }

        if (interaction.customId === 'transferencia') {
            await interaction.reply({
                ephemeral: true,
                content:
                    '🏦 *Transferencia Bancaria (México)*\nBanco: BBVA\nCLABE: 012345678901234567\nTitular: Juan Pérez\nReferencia: DiscordPago',
            });
        }
    }
});

client.login(process.env.TOKEN);
