import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Kong Enterprise',
    Svg: require('../../static/img/kong-combination-mark-colors.svg').default,
    description: (
      <>
      A Plataforma de conectividade de serviços end-to-end para multi-cloud e organizações híbridas
     
      </>
    ),
  },
  {
    title: 'Aws Elastic Kubernetes Service(EKS)',
    Svg: require('../../static/img/Amazon_Web_Services-Logo.wine.svg').default,
    description: (
      <>
 É um serviço gerenciado que você pode usar para executar o Kubernetes na AWS.
      </>
    ),
  },
  {
    title: 'Rode K8s em qualquer lugar',
    Svg: require('../../static/img/Kubernetes_logo.svg').default,
    description: (
      <>
       O Kubernetes é um sistema de código aberto para automatizar a implantação, a escalabilidade e o gerenciamento de aplicações em contêineres.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
