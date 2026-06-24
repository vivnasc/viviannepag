import EstudioVS from '@/components/admin/EstudioVS';

// MÉTODO VS · a conta MÃE. O estúdio completo (prever · texto · legenda · motion · som ·
// tipografia · efeito · tempo · render · agendar) vive no componente partilhado EstudioVS,
// que a mãe e as 3 filhas (ver · vir · viver) reutilizam. A mãe é o roaming dos 7 véus;
// as filhas ancoram cada post à sua voz própria (ver components/admin/EstudioVS + gerar.ts).
export default function MetodoVSPage() {
  return <EstudioVS conta="mae" />;
}
