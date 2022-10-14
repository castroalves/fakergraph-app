import "../styles/globals.css";
import type { AppProps } from "next/app";
import { BaukastenProvider } from "@hygraph/baukasten";

import "@fontsource/inter/variable.css";
import { Wrapper } from "@graphcms/app-sdk-react";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Wrapper>
            <BaukastenProvider global>
                <Component {...pageProps} />
            </BaukastenProvider>
        </Wrapper>
    );
}

export default MyApp;
