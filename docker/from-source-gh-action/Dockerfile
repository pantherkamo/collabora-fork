# Modified by Kamo (https://github.com/pantherkamo/collabora-fork)
# Full source build — LibreOffice core + Collabora Online with custom branding

FROM ubuntu:24.04 AS builder

# Build from source (no pre-built assets) with custom product name
ENV CORE_BRANCH=distro/collabora/co-25.04
ENV PRODUCT_NAME=Office
ENV BUILDDIR=/build
ENV ONLINE_EXTRA_BUILD_OPTIONS=--enable-experimental

WORKDIR /build

RUN --mount=type=cache,target=/var/cache/apt apt-get update && \
    DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get -y install \
    # runtime dependencies (also needed at build time)
    libpng16-16 fontconfig adduser cpio tzdata findutils \
    libcap2-bin openssl openssh-client \
    libxcb-shm0 libxcb-render0 libxrender1 libxext6 \
    fonts-wqy-zenhei fonts-wqy-microhei fonts-droid-fallback \
    fonts-noto-cjk \
    # collabora online build dependencies
    python3-polib libcap-dev npm \
    libpam-dev libzstd-dev wget git build-essential libtool \
    python3-lxml libpng-dev libcppunit-dev \
    pkg-config chromium-browser rsync curl \
    # core (LibreOffice) build dependencies
    zip ccache automake autoconf gperf nasm xsltproc flex bison \
    ant junit4 libfontconfig1-dev libfreetype6-dev libharfbuzz-dev \
    libicu-dev libnspr4-dev libnss3-dev libssl-dev libxml2-dev \
    libxslt1-dev python3-dev libkrb5-dev gettext uuid-runtime \
    zlib1g-dev

RUN curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh && bash nodesource_setup.sh && apt install -y nodejs

RUN mkdir -p $BUILDDIR

# Build poco separately to cache it
ADD https://pocoproject.org/releases/poco-1.12.5p2/poco-1.12.5p2-all.tar.gz /build/builddir/poco-1.12.5p2-all.tar.gz

RUN cd builddir && tar xf poco-1.12.5p2-all.tar.gz && cd poco-1.12.5p2-all/ && \
    ./configure --static --no-tests --no-samples --no-sharedlibs --cflags="-fPIC" --omit=Zip,Data,Data/SQLite,Data/ODBC,Data/MySQL,MongoDB,PDF,CppParser,PageCompiler,Redis,Encodings,ActiveRecord --prefix=$BUILDDIR/poco && \
    make -j $(nproc) && \
    make install

COPY / $BUILDDIR/

# Bust the Docker layer cache when the online source changes.
# The commit SHA changes on every push, forcing build.sh to re-run
# and git-fetch the latest online source.
ARG ONLINE_COMMIT_SHA=unknown
RUN --mount=type=cache,target=/build/builddir/core \
    --mount=type=cache,target=/root/.ccache \
    echo "Building online commit: $ONLINE_COMMIT_SHA" && \
    bash build.sh

# Build the final image
FROM ubuntu:24.04

# UTF-8 locale is needed to handle file names with non-ASCII characters
ENV LC_CTYPE=C.UTF-8

RUN apt-get update \
    && apt-get -y install libpng16-16 fontconfig adduser cpio tzdata \
    findutils \
    libcap2-bin openssl openssh-client \
    libxcb-shm0 libxcb-render0 libxrender1 libxext6 \
    fonts-wqy-zenhei fonts-wqy-microhei fonts-droid-fallback \
    fonts-noto-cjk ca-certificates \
    libnss-wrapper libnspr4 libnss3 \
    && rm -rf /var/lib/apt/lists/*

# copy freshly built LOKit and Collabora Online
COPY --from=builder /build/instdir /

# copy the shell script which can start Collabora Online (coolwsd)
COPY start-collabora-online.sh /start-collabora-online.sh
RUN chmod +x /start-collabora-online.sh

# Bundle system libraries into lokit/program/ — the from-source build links
# against system libs, but the chroot jail only has access to /opt/lokit/program/.
# Pre-built Collabora assets bundle these; our source build does not.
RUN for lib in \
    libnspr4.so libnss3.so libnssutil3.so libplc4.so libplds4.so \
    libsmime3.so libssl3.so libsoftokn3.so libfreebl3.so libfreeblpriv3.so \
    libnssckbi.so libnssdbm3.so \
    libfontconfig.so.1 libfreetype.so.6 libpng16.so.16 \
    libz.so.1 libexpat.so.1 libbz2.so.1.0 \
    libbrotlidec.so.1 libbrotlicommon.so.1 \
    libgssapi_krb5.so.2 libkrb5.so.3 libk5crypto.so.3 \
    libkrb5support.so.0 libkeyutils.so.1 libcom_err.so.2; do \
    src=$(find /usr/lib /lib -name "$lib" -type f -o -name "$lib" -type l 2>/dev/null | head -1); \
    if [ -n "$src" ]; then \
      cp -L "$src" /opt/lokit/program/ && echo "Bundled $lib"; \
    fi; \
    done

# set up (normally done by postinstall script of package)
RUN setcap cap_fowner,cap_chown,cap_sys_chroot=ep /usr/bin/coolforkit-caps && \
    setcap cap_sys_admin=ep /usr/bin/coolmount && \
    adduser --quiet --system --group --home /opt/cool cool && \
    rm -rf /opt/cool || true && \
    mkdir -p /opt/cool/child-roots /opt/cool/cache && \
    chown cool: /opt/cool && \
    chown cool: /opt/cool/child-roots && \
    chown cool: /opt/cool/cache && \
    fc-cache /opt/lokit/share/fonts/truetype && \
    coolwsd-systemplate-setup /opt/cool/systemplate /opt/lokit >/dev/null 2>&1 && \
    touch /var/log/coolwsd.log && \
    chown cool:cool /var/log/coolwsd.log && \
    chown -R cool:cool /etc/coolwsd && \
    find /opt/cool -user cool -exec chown -h 1001:1001 {} \; && \
    usermod -u 1001 cool && groupmod -g 1001 cool && \
    chown cool:cool /etc/coolwsd/coolwsd.xml && \
    chmod 640 /etc/coolwsd/coolwsd.xml && \
    chown cool:cool /etc/coolwsd && \
    rm -rf /etc/coolwsd/proof_key* && \
    chown cool:cool /start-collabora-online.sh

EXPOSE 9980

USER 1001

ENTRYPOINT ["/start-collabora-online.sh"]
