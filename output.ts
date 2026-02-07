import * as os from 'os';

/**
 * Formata um número de bytes para uma string legível (KB, MB, GB, TB).
 * @param bytes O número de bytes.
 * @returns A string formatada.
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formata um número de segundos para uma string de tempo legível (dias, horas, minutos, segundos).
 * @param seconds O número de segundos.
 * @returns A string de tempo formatada.
 */
function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return `${days}d ${hours}h ${minutes}m ${Math.floor(seconds)}s`;
}

console.log("--- Informações de Hardware e Sistema ---");

// Informações do Sistema Operacional
console.log(`\nSistema Operacional:`);
console.log(`  Tipo: ${os.type()}`);
console.log(`  Plataforma: ${os.platform()}`);
console.log(`  Release: ${os.release()}`);
console.log(`  Arquitetura: ${os.arch()}`);
console.log(`  Hostname: ${os.hostname()}`);
console.log(`  Uptime do Sistema: ${formatUptime(os.uptime())}`);

// Informações de Memória RAM
console.log(`\nMemória:`);
const totalMemory = os.totalmem();
const freeMemory = os.freemem();
console.log(`  Total: ${formatBytes(totalMemory)}`);
console.log(`  Livre: ${formatBytes(freeMemory)} (${((freeMemory / totalMemory) * 100).toFixed(2)}% livre)`);

// Informações da CPU (Processador)
console.log(`\nCPU (Processador):`);
const cpus = os.cpus();
if (cpus.length > 0) {
    console.log(`  Modelo: ${cpus[0].model}`);
    console.log(`  Velocidade Média (Nominal): ${cpus[0].speed} MHz`);
    console.log(`  Núcleos Lógicos (Threads): ${cpus.length}`);
    console.log(`  Informações por Núcleo:`);
    cpus.forEach((cpu, index) => {
        console.log(`    - Núcleo ${index + 1}:`);
        console.log(`      Modelo: ${cpu.model}`);
        console.log(`      Velocidade: ${cpu.speed} MHz`);
        // Opcional: Para informações mais detalhadas sobre o uso de tempo do núcleo
        // console.log(`      Tempos (user/nice/sys/idle/irq): ${cpu.times.user}/${cpu.times.nice}/${cpu.times.sys}/${cpu.times.idle}/${cpu.times.irq}`);
    });
} else {
    console.log("  Nenhuma informação de CPU encontrada.");
}

// Informações de Redes
console.log(`\nInformações de Rede:`);
const networkInterfaces = os.networkInterfaces();
for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    if (interfaces && interfaces.length > 0) {
        console.log(`  Adaptador: ${interfaceName}`);
        interfaces.forEach(net => {
            console.log(`    - Família: ${net.family}`);
            console.log(`      Endereço IP: ${net.address}`);
            console.log(`      Máscara de Sub-rede: ${net.netmask}`);
            console.log(`      MAC: ${net.mac}`);
            console.log(`      Loopback/Interno: ${net.internal ? 'Sim' : 'Não'}`);
        });
    }
}

console.log("\n--- Fim das Informações ---");

// Como executar este código (necessário Node.js e TypeScript):
// 1. Salve o código em um arquivo, por exemplo, `hardwareInfo.ts`.
// 2. Abra o terminal na pasta onde salvou o arquivo.
// 3. Compile o TypeScript para JavaScript: `npx tsc hardwareInfo.ts`.
// 4. Execute o arquivo JavaScript compilado: `node hardwareInfo.js`.
//
// Ou, se tiver `ts-node` instalado:
// 1. Execute diretamente: `npx ts-node hardwareInfo.ts`.