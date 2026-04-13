--
-- PostgreSQL database dump
--

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: set_article_published_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.set_article_published_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
        NEW.published_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: update_article_series_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_article_series_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_articles_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_articles_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_profile_introduction_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_profile_introduction_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.admin_users (
    id bigint NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    auth_provider character varying(50) DEFAULT 'LOCAL'::character varying,
    role character varying(50) DEFAULT 'ROLE_ADMIN'::character varying NOT NULL,
    last_login timestamp without time zone,
    login_attempts integer DEFAULT 0,
    locked_until timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE admin_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.admin_users IS 'Admin Dashboard 사용자 테이블 - 확장된 인증 정보 포함';


--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.admin_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: article_series; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.article_series (
    id bigint NOT NULL,
    series_id character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    thumbnail_url character varying(500),
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: article_series_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.article_series_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: article_series_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.article_series_id_seq OWNED BY public.article_series.id;


--
-- Name: article_tech_stack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.article_tech_stack (
    id bigint NOT NULL,
    article_id bigint NOT NULL,
    tech_name character varying(100) NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: article_tech_stack_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.article_tech_stack_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: article_tech_stack_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.article_tech_stack_id_seq OWNED BY public.article_tech_stack.id;


--
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.articles (
    id bigint NOT NULL,
    business_id character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    summary text,
    content text NOT NULL,
    project_id bigint,
    category character varying(50),
    tags text[],
    status character varying(50) DEFAULT 'published'::character varying,
    published_at timestamp without time zone,
    sort_order integer DEFAULT 0,
    view_count integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    featured_sort_order integer,
    series_id character varying(50),
    series_order integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.articles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.certifications (
    id bigint NOT NULL,
    business_id character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    issuer character varying(255) NOT NULL,
    date date,
    expiry_date date,
    credential_id character varying(255),
    credential_url character varying(500),
    description text,
    category character varying(100),
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: certifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.certifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certifications_id_seq OWNED BY public.certifications.id;


--
-- Name: education; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.education (
    id bigint NOT NULL,
    business_id character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    organization character varying(255) NOT NULL,
    degree character varying(255),
    major character varying(255),
    start_date date,
    end_date date,
    gpa numeric(3,2),
    type character varying(50),
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: education_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.education_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.education_id_seq OWNED BY public.education.id;


--
-- Name: education_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.education_projects (
    id bigint NOT NULL,
    education_id bigint NOT NULL,
    project_id bigint NOT NULL,
    project_type character varying(100),
    grade character varying(50),
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE education_projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.education_projects IS '교육-프로젝트 매핑 테이블';


--
-- Name: education_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.education_projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: education_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.education_projects_id_seq OWNED BY public.education_projects.id;


--
-- Name: education_tech_stack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.education_tech_stack (
    id bigint NOT NULL,
    education_id bigint NOT NULL,
    tech_stack_id bigint NOT NULL,
    is_primary boolean DEFAULT false,
    usage_description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE education_tech_stack; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.education_tech_stack IS '교육-기술스택 매핑 테이블 (id 기반 외래키)';


--
-- Name: education_tech_stack_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.education_tech_stack_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: education_tech_stack_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.education_tech_stack_id_seq OWNED BY public.education_tech_stack.id;


--
-- Name: experience_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.experience_projects (
    id bigint NOT NULL,
    experience_id bigint NOT NULL,
    project_id bigint NOT NULL,
    role_in_project character varying(255),
    contribution_description text,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE experience_projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.experience_projects IS '경력-프로젝트 매핑 테이블';


--
-- Name: experience_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.experience_projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: experience_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.experience_projects_id_seq OWNED BY public.experience_projects.id;


--
-- Name: experience_tech_stack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.experience_tech_stack (
    id bigint NOT NULL,
    experience_id bigint NOT NULL,
    tech_stack_id bigint NOT NULL,
    is_primary boolean DEFAULT false,
    usage_description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE experience_tech_stack; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.experience_tech_stack IS '경력-기술스택 매핑 테이블 (id 기반 외래키)';


--
-- Name: experience_tech_stack_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.experience_tech_stack_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: experience_tech_stack_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.experience_tech_stack_id_seq OWNED BY public.experience_tech_stack.id;


--
-- Name: experiences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.experiences (
    id bigint NOT NULL,
    business_id character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    organization character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date,
    main_responsibilities text[],
    achievements text[],
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    job_field character varying(100),
    employment_type character varying(50)
);


--
-- Name: COLUMN experiences.job_field; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.experiences.job_field IS '직무 분야 (개발, 교육, 디자인 등)';


--
-- Name: COLUMN experiences.employment_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.experiences.employment_type IS '계약 조건 (정규직, 계약직, 프리랜서 등)';


--
-- Name: experiences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.experiences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: experiences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.experiences_id_seq OWNED BY public.experiences.id;


--
-- Name: profile_introduction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.profile_introduction (
    id bigint NOT NULL,
    content text NOT NULL,
    version integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: profile_introduction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.profile_introduction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profile_introduction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profile_introduction_id_seq OWNED BY public.profile_introduction.id;


--
-- Name: project_screenshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.project_screenshots (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    image_url character varying(500) NOT NULL,
    cloudinary_public_id character varying(255),
    display_order integer DEFAULT 0,
    alt_text character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE project_screenshots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.project_screenshots IS '프로젝트 스크린샷 이미지 관리 테이블';


--
-- Name: project_screenshots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.project_screenshots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_screenshots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_screenshots_id_seq OWNED BY public.project_screenshots.id;


--
-- Name: project_tech_stack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.project_tech_stack (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    tech_stack_id bigint NOT NULL,
    is_primary boolean DEFAULT false,
    usage_description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE project_tech_stack; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.project_tech_stack IS '프로젝트-기술스택 매핑 테이블 (id 기반 외래키)';


--
-- Name: project_tech_stack_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.project_tech_stack_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_tech_stack_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_tech_stack_id_seq OWNED BY public.project_tech_stack.id;


--
-- Name: project_technical_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.project_technical_cards (
    id bigint NOT NULL,
    business_id character varying(50) NOT NULL,
    project_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(50) NOT NULL,
    problem_statement text NOT NULL,
    analysis text,
    solution text NOT NULL,
    article_id bigint,
    is_pinned boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: project_technical_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.project_technical_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_technical_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_technical_cards_id_seq OWNED BY public.project_technical_cards.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.projects (
    id bigint NOT NULL,
    business_id character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    start_date date,
    end_date date,
    github_url character varying(500),
    live_url character varying(500),
    image_url character varying(500),
    readme text,
    type character varying(100),
    source character varying(100),
    is_team boolean DEFAULT false,
    team_size integer,
    status character varying(50) DEFAULT 'completed'::character varying,
    sort_order integer DEFAULT 0,
    external_url character varying(500),
    my_contributions text[],
    role character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    screenshots bigint[],
    is_featured boolean DEFAULT false
);


--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.projects IS 'Projects table - detailed_description column removed as it was unused';


--
-- Name: COLUMN projects.is_featured; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.is_featured IS '프로젝트가 추천/특별 프로젝트인지 여부';


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: tech_stack_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.tech_stack_metadata (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    level character varying(20) NOT NULL,
    is_core boolean DEFAULT false,
    is_active boolean DEFAULT true,
    icon_url character varying(500),
    color_hex character varying(7),
    description text,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tech_stack_metadata_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.tech_stack_metadata_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tech_stack_metadata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tech_stack_metadata_id_seq OWNED BY public.tech_stack_metadata.id;


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: article_series id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_series ALTER COLUMN id SET DEFAULT nextval('public.article_series_id_seq'::regclass);


--
-- Name: article_tech_stack id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_tech_stack ALTER COLUMN id SET DEFAULT nextval('public.article_tech_stack_id_seq'::regclass);


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: certifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications ALTER COLUMN id SET DEFAULT nextval('public.certifications_id_seq'::regclass);


--
-- Name: education id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education ALTER COLUMN id SET DEFAULT nextval('public.education_id_seq'::regclass);


--
-- Name: education_projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_projects ALTER COLUMN id SET DEFAULT nextval('public.education_projects_id_seq'::regclass);


--
-- Name: education_tech_stack id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_tech_stack ALTER COLUMN id SET DEFAULT nextval('public.education_tech_stack_id_seq'::regclass);


--
-- Name: experience_projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_projects ALTER COLUMN id SET DEFAULT nextval('public.experience_projects_id_seq'::regclass);


--
-- Name: experience_tech_stack id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_tech_stack ALTER COLUMN id SET DEFAULT nextval('public.experience_tech_stack_id_seq'::regclass);


--
-- Name: experiences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiences ALTER COLUMN id SET DEFAULT nextval('public.experiences_id_seq'::regclass);


--
-- Name: profile_introduction id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_introduction ALTER COLUMN id SET DEFAULT nextval('public.profile_introduction_id_seq'::regclass);


--
-- Name: project_screenshots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_screenshots ALTER COLUMN id SET DEFAULT nextval('public.project_screenshots_id_seq'::regclass);


--
-- Name: project_tech_stack id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tech_stack ALTER COLUMN id SET DEFAULT nextval('public.project_tech_stack_id_seq'::regclass);


--
-- Name: project_technical_cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_technical_cards ALTER COLUMN id SET DEFAULT nextval('public.project_technical_cards_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: tech_stack_metadata id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tech_stack_metadata ALTER COLUMN id SET DEFAULT nextval('public.tech_stack_metadata_id_seq'::regclass);


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_key UNIQUE (username);


--
-- Name: article_series article_series_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_series
    ADD CONSTRAINT article_series_pkey PRIMARY KEY (id);


--
-- Name: article_series article_series_series_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_series
    ADD CONSTRAINT article_series_series_id_key UNIQUE (series_id);


--
-- Name: article_tech_stack article_tech_stack_article_id_tech_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_tech_stack
    ADD CONSTRAINT article_tech_stack_article_id_tech_name_key UNIQUE (article_id, tech_name);


--
-- Name: article_tech_stack article_tech_stack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_tech_stack
    ADD CONSTRAINT article_tech_stack_pkey PRIMARY KEY (id);


--
-- Name: articles articles_business_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_business_id_key UNIQUE (business_id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: certifications certifications_business_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_business_id_key UNIQUE (business_id);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (id);


--
-- Name: education education_business_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_business_id_key UNIQUE (business_id);


--
-- Name: education education_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_pkey PRIMARY KEY (id);


--
-- Name: education_projects education_projects_education_id_project_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_projects
    ADD CONSTRAINT education_projects_education_id_project_id_key UNIQUE (education_id, project_id);


--
-- Name: education_projects education_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_projects
    ADD CONSTRAINT education_projects_pkey PRIMARY KEY (id);


--
-- Name: education_tech_stack education_tech_stack_education_id_tech_stack_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_tech_stack
    ADD CONSTRAINT education_tech_stack_education_id_tech_stack_id_key UNIQUE (education_id, tech_stack_id);


--
-- Name: education_tech_stack education_tech_stack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_tech_stack
    ADD CONSTRAINT education_tech_stack_pkey PRIMARY KEY (id);


--
-- Name: experience_projects experience_projects_experience_id_project_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_projects
    ADD CONSTRAINT experience_projects_experience_id_project_id_key UNIQUE (experience_id, project_id);


--
-- Name: experience_projects experience_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_projects
    ADD CONSTRAINT experience_projects_pkey PRIMARY KEY (id);


--
-- Name: experience_tech_stack experience_tech_stack_experience_id_tech_stack_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_tech_stack
    ADD CONSTRAINT experience_tech_stack_experience_id_tech_stack_id_key UNIQUE (experience_id, tech_stack_id);


--
-- Name: experience_tech_stack experience_tech_stack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_tech_stack
    ADD CONSTRAINT experience_tech_stack_pkey PRIMARY KEY (id);


--
-- Name: experiences experiences_business_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_business_id_key UNIQUE (business_id);


--
-- Name: experiences experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_pkey PRIMARY KEY (id);


--
-- Name: profile_introduction profile_introduction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_introduction
    ADD CONSTRAINT profile_introduction_pkey PRIMARY KEY (id);


--
-- Name: project_screenshots project_screenshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_screenshots
    ADD CONSTRAINT project_screenshots_pkey PRIMARY KEY (id);


--
-- Name: project_tech_stack project_tech_stack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tech_stack
    ADD CONSTRAINT project_tech_stack_pkey PRIMARY KEY (id);


--
-- Name: project_tech_stack project_tech_stack_project_id_tech_stack_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tech_stack
    ADD CONSTRAINT project_tech_stack_project_id_tech_stack_id_key UNIQUE (project_id, tech_stack_id);


--
-- Name: project_technical_cards project_technical_cards_business_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_technical_cards
    ADD CONSTRAINT project_technical_cards_business_id_key UNIQUE (business_id);


--
-- Name: project_technical_cards project_technical_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_technical_cards
    ADD CONSTRAINT project_technical_cards_pkey PRIMARY KEY (id);


--
-- Name: projects projects_business_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_business_id_key UNIQUE (business_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: tech_stack_metadata tech_stack_metadata_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tech_stack_metadata
    ADD CONSTRAINT tech_stack_metadata_name_key UNIQUE (name);


--
-- Name: tech_stack_metadata tech_stack_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tech_stack_metadata
    ADD CONSTRAINT tech_stack_metadata_pkey PRIMARY KEY (id);


--
-- Name: projects uk_projects_business_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT uk_projects_business_id UNIQUE (business_id);


--
-- Name: CONSTRAINT uk_projects_business_id ON projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT uk_projects_business_id ON public.projects IS 'Business ID 유니크 제약조건 - ID 생성 충돌 방지';


--
-- Name: idx_admin_users_auth_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_admin_users_auth_provider ON public.admin_users USING btree (auth_provider);


--
-- Name: idx_admin_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users USING btree (email);


--
-- Name: idx_admin_users_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users USING btree (is_active);


--
-- Name: idx_admin_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users USING btree (username);


--
-- Name: idx_article_series_series_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_article_series_series_id ON public.article_series USING btree (series_id);


--
-- Name: idx_article_series_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_article_series_sort_order ON public.article_series USING btree (sort_order);


--
-- Name: idx_article_tech_stack_article_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_article_tech_stack_article_id ON public.article_tech_stack USING btree (article_id);


--
-- Name: idx_article_tech_stack_tech_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_article_tech_stack_tech_name ON public.article_tech_stack USING btree (tech_name);


--
-- Name: idx_articles_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_articles_business_id ON public.articles USING btree (business_id);


--
-- Name: idx_articles_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles USING btree (category);


--
-- Name: idx_articles_featured_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_articles_featured_sort_order ON public.articles USING btree (featured_sort_order) WHERE (is_featured = true);


--
-- Name: idx_articles_is_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON public.articles USING btree (is_featured) WHERE (is_featured = true);


--
-- Name: idx_articles_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_articles_project_id ON public.articles USING btree (project_id);


--
-- Name: idx_articles_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles USING btree (published_at);


--
-- Name: idx_articles_series_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_articles_series_id ON public.articles USING btree (series_id) WHERE (series_id IS NOT NULL);


--
-- Name: idx_articles_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_articles_sort_order ON public.articles USING btree (sort_order);


--
-- Name: idx_articles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles USING btree (status);


--
-- Name: idx_articles_view_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_articles_view_count ON public.articles USING btree (view_count) WHERE ((status)::text = 'published'::text);


--
-- Name: idx_certifications_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_certifications_business_id ON public.certifications USING btree (business_id);


--
-- Name: idx_certifications_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_certifications_date ON public.certifications USING btree (date);


--
-- Name: idx_certifications_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_certifications_sort_order ON public.certifications USING btree (sort_order);


--
-- Name: idx_education_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_education_business_id ON public.education USING btree (business_id);


--
-- Name: idx_education_projects_education_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_education_projects_education_id ON public.education_projects USING btree (education_id);


--
-- Name: idx_education_projects_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_education_projects_project_id ON public.education_projects USING btree (project_id);


--
-- Name: idx_education_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_education_sort_order ON public.education USING btree (sort_order);


--
-- Name: idx_education_start_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_education_start_date ON public.education USING btree (start_date);


--
-- Name: idx_education_tech_stack_education_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_education_tech_stack_education_id ON public.education_tech_stack USING btree (education_id);


--
-- Name: idx_education_tech_stack_is_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_education_tech_stack_is_primary ON public.education_tech_stack USING btree (is_primary);


--
-- Name: idx_education_tech_stack_tech_stack_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_education_tech_stack_tech_stack_id ON public.education_tech_stack USING btree (tech_stack_id);


--
-- Name: idx_experience_projects_experience_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_experience_projects_experience_id ON public.experience_projects USING btree (experience_id);


--
-- Name: idx_experience_projects_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_experience_projects_project_id ON public.experience_projects USING btree (project_id);


--
-- Name: idx_experience_tech_stack_experience_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_experience_tech_stack_experience_id ON public.experience_tech_stack USING btree (experience_id);


--
-- Name: idx_experience_tech_stack_is_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_experience_tech_stack_is_primary ON public.experience_tech_stack USING btree (is_primary);


--
-- Name: idx_experience_tech_stack_tech_stack_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_experience_tech_stack_tech_stack_id ON public.experience_tech_stack USING btree (tech_stack_id);


--
-- Name: idx_experiences_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_experiences_business_id ON public.experiences USING btree (business_id);


--
-- Name: idx_experiences_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_experiences_sort_order ON public.experiences USING btree (sort_order);


--
-- Name: idx_experiences_start_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_experiences_start_date ON public.experiences USING btree (start_date);


--
-- Name: idx_project_screenshots_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_project_screenshots_display_order ON public.project_screenshots USING btree (display_order);


--
-- Name: idx_project_screenshots_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_project_screenshots_project_id ON public.project_screenshots USING btree (project_id);


--
-- Name: idx_project_tech_stack_is_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_project_tech_stack_is_primary ON public.project_tech_stack USING btree (is_primary);


--
-- Name: idx_project_tech_stack_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_project_tech_stack_project_id ON public.project_tech_stack USING btree (project_id);


--
-- Name: idx_project_tech_stack_tech_stack_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_project_tech_stack_tech_stack_id ON public.project_tech_stack USING btree (tech_stack_id);


--
-- Name: idx_projects_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_business_id ON public.projects USING btree (business_id);


--
-- Name: idx_projects_is_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON public.projects USING btree (is_featured);


--
-- Name: idx_projects_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON public.projects USING btree (sort_order);


--
-- Name: idx_projects_start_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_start_date ON public.projects USING btree (start_date);


--
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects USING btree (status);


--
-- Name: idx_projects_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects USING btree (type);


--
-- Name: idx_tech_stack_metadata_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_tech_stack_metadata_category ON public.tech_stack_metadata USING btree (category);


--
-- Name: idx_tech_stack_metadata_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_tech_stack_metadata_is_active ON public.tech_stack_metadata USING btree (is_active);


--
-- Name: idx_tech_stack_metadata_is_core; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_tech_stack_metadata_is_core ON public.tech_stack_metadata USING btree (is_core);


--
-- Name: idx_tech_stack_metadata_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_tech_stack_metadata_name ON public.tech_stack_metadata USING btree (name);


--
-- Name: idx_tech_stack_metadata_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_tech_stack_metadata_sort_order ON public.tech_stack_metadata USING btree (sort_order);


--
-- Name: idx_technical_cards_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_technical_cards_category ON public.project_technical_cards USING btree (category);


--
-- Name: idx_technical_cards_pinned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_technical_cards_pinned ON public.project_technical_cards USING btree (is_pinned);


--
-- Name: idx_technical_cards_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_technical_cards_project ON public.project_technical_cards USING btree (project_id);


--
-- Name: article_series article_series_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER article_series_updated_at BEFORE UPDATE ON public.article_series FOR EACH ROW EXECUTE FUNCTION public.update_article_series_updated_at();


--
-- Name: articles articles_set_published_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER articles_set_published_at BEFORE INSERT OR UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_article_published_at();


--
-- Name: articles articles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_articles_updated_at();


--
-- Name: profile_introduction profile_introduction_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER profile_introduction_updated_at BEFORE UPDATE ON public.profile_introduction FOR EACH ROW EXECUTE FUNCTION public.update_profile_introduction_updated_at();


--
-- Name: admin_users update_admin_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: certifications update_certifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: education_projects update_education_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_education_projects_updated_at BEFORE UPDATE ON public.education_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: education_tech_stack update_education_tech_stack_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_education_tech_stack_updated_at BEFORE UPDATE ON public.education_tech_stack FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: education update_education_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_education_updated_at BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: experience_projects update_experience_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_experience_projects_updated_at BEFORE UPDATE ON public.experience_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: experience_tech_stack update_experience_tech_stack_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_experience_tech_stack_updated_at BEFORE UPDATE ON public.experience_tech_stack FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: experiences update_experiences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: project_screenshots update_project_screenshots_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_project_screenshots_updated_at BEFORE UPDATE ON public.project_screenshots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: project_tech_stack update_project_tech_stack_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_project_tech_stack_updated_at BEFORE UPDATE ON public.project_tech_stack FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tech_stack_metadata update_tech_stack_metadata_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER update_tech_stack_metadata_updated_at BEFORE UPDATE ON public.tech_stack_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: article_tech_stack article_tech_stack_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_tech_stack
    ADD CONSTRAINT article_tech_stack_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;


--
-- Name: article_tech_stack article_tech_stack_tech_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_tech_stack
    ADD CONSTRAINT article_tech_stack_tech_name_fkey FOREIGN KEY (tech_name) REFERENCES public.tech_stack_metadata(name) ON DELETE CASCADE;


--
-- Name: articles articles_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: education_projects education_projects_education_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_projects
    ADD CONSTRAINT education_projects_education_id_fkey FOREIGN KEY (education_id) REFERENCES public.education(id) ON DELETE CASCADE;


--
-- Name: education_projects education_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_projects
    ADD CONSTRAINT education_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: education_tech_stack education_tech_stack_education_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_tech_stack
    ADD CONSTRAINT education_tech_stack_education_id_fkey FOREIGN KEY (education_id) REFERENCES public.education(id) ON DELETE CASCADE;


--
-- Name: education_tech_stack education_tech_stack_tech_stack_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_tech_stack
    ADD CONSTRAINT education_tech_stack_tech_stack_id_fkey FOREIGN KEY (tech_stack_id) REFERENCES public.tech_stack_metadata(id) ON DELETE CASCADE;


--
-- Name: experience_projects experience_projects_experience_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_projects
    ADD CONSTRAINT experience_projects_experience_id_fkey FOREIGN KEY (experience_id) REFERENCES public.experiences(id) ON DELETE CASCADE;


--
-- Name: experience_projects experience_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_projects
    ADD CONSTRAINT experience_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: experience_tech_stack experience_tech_stack_experience_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_tech_stack
    ADD CONSTRAINT experience_tech_stack_experience_id_fkey FOREIGN KEY (experience_id) REFERENCES public.experiences(id) ON DELETE CASCADE;


--
-- Name: experience_tech_stack experience_tech_stack_tech_stack_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_tech_stack
    ADD CONSTRAINT experience_tech_stack_tech_stack_id_fkey FOREIGN KEY (tech_stack_id) REFERENCES public.tech_stack_metadata(id) ON DELETE CASCADE;


--
-- Name: project_screenshots project_screenshots_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_screenshots
    ADD CONSTRAINT project_screenshots_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_tech_stack project_tech_stack_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tech_stack
    ADD CONSTRAINT project_tech_stack_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_tech_stack project_tech_stack_tech_stack_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tech_stack
    ADD CONSTRAINT project_tech_stack_tech_stack_id_fkey FOREIGN KEY (tech_stack_id) REFERENCES public.tech_stack_metadata(id) ON DELETE CASCADE;


--
-- Name: project_technical_cards project_technical_cards_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_technical_cards
    ADD CONSTRAINT project_technical_cards_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE SET NULL;


--
-- Name: project_technical_cards project_technical_cards_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_technical_cards
    ADD CONSTRAINT project_technical_cards_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

