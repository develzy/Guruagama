import Link from "next/link";
import styles from "./profil.module.css";

export default function ProfilePage() {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        ← Kembali
      </Link>

      <div className={styles.profileCard}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>
            <img 
              src="/m-khulal.png" 
              alt="Mukhammad Lu'lu Khulaluddin, S.F.U" 
              className={styles.profileImage}
            />
          </div>
        </div>

        <h1 className={styles.name}>Mukhammad Lu&apos;lu Khulaluddin, S.F.U</h1>
        <div className={styles.role}>Sarjana Fiqh & Ushul Fiqh</div>

        <p className={styles.bio}>
          Lulusan Ma&apos;had Aly Lirboyo Kediri dengan keahlian khusus di bidang Fiqh,
          Ushul Fiqh, dan teknologi informasi. Berkomitmen dalam memadukan
          kedalaman syariat dengan inovasi digital modern.
        </p>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Instansi Saat Ini</div>
            <div className={styles.infoValue}>SDN 01 Kalisalak</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Pendidikan Terakhir</div>
            <div className={styles.infoValue}>Ma&apos;had Aly Lirboyo (S1)</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Bidang Keahlian</div>
            <div className={styles.infoValue}>Pendidik, Fiqh Wa Ushul Fiqh & IT</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Lokasi</div>
            <div className={styles.infoValue}>Tegal, Jawa Tengah</div>
          </div>
        </div>

        <div style={{ marginTop: "3rem", width: "100%", padding: "2rem", background: "rgba(255,255,255,0.02)", borderRadius: "1.5rem" }}>
          <h3 style={{ color: "var(--accent)", marginBottom: "1rem", fontSize: "0.9rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Jejak Pengalaman</h3>
          <ul style={{ textAlign: "left", color: "#888", listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "1rem" }}>• Pernah berkhidmat di Pondok Pesantren Lirboyo sebagai Pendidik & Sekretaris Satu.</li>
            <li style={{ marginBottom: "1rem" }}>• Membimbing pembelajaran Teknologi & Pengembangan Web bagi para santri.</li>
            <li>• Pengalaman sebagai Pendidik Bantu (Keagamaan Islam) di SMP N 01 Kota Kediri.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
