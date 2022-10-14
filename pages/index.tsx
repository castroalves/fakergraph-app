import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <h3>FakerGraph for Hygraph</h3>
            <p>Generate fake content for Hygraph projects.</p>
        </div>
    );
};

export default Home;
